define(['backbone', 'underscore', 'jquery', '../../lib/format', '../../collections/elementDimensions'],
function (Backbone, _, $, format, ElementDimensionCollection) {
    'use strict';

    /**
     * Abstract base class for element models
     *
     * Derived classes should
     *  - implement:
     *      initConnections(opts)
     *      getConnections(opts)
     *          should return an array of all the connections models related to the element
     *      removeConnections()
     *      isLoaded()
     *      _getConnection(type, [id])
     *      buildCutArgs(cutValue, index)
     *
     *  - listen to the 'sync' event (triggered by any connection) in order to invoke
     *  this.ready() when appropriate.
     *
     * Derived classes are supposed to store their connections in either
     * this._connections or this._connection which have both to be meant as
     * 'protected' instance properties.
     *
     */
    var Element = Backbone.Model.extend({

        // Allowed element types mapped by their dimensionality
        elementTypes: {
            monoDimensional:  ['bar', 'bubble', 'line', 'table', 'geo'],
            multiDimensional: ['navigation', 'summary']
        },

        // Field types that can be used with each element type
        allowedFields: {
            geo         : function(f) { return (f.get('type') === 'geo'); },
            navigation  : function(f) { return (f.get('type') === 'string'); },
            summary     : function() { return false; },
            default     : function() { return true; }
        },

        // Field types that have an associated dimension connection model.
        // For the other types (basically numeric and dates) it makes sense to
        // use observation values as labels - see this.getLabel().
        dimensionFields: ['string', 'geo'],

        // Measure aggregation types
        aggregationTypes: [
            {name: 'sum', label: 'Total'},
            {name: 'mean', label: 'Average'}
        ],

        // Field types whose values could be bucketed. We need to keep track of
        // them because for those fields cut values should be defined by ranges
        // of values
        bucketFields: ['date', 'float', 'integer'],

        // Regex to test for a valid parent property name in a hierarchical dimension
        validParent: /\d+/,

        /**
         * Get element model URL
         */
        url: function () {
            var path = [
                'api/datasets',
                this.dataset.get('id'),
                'visualisations',
                this.visualisation.get('id'),
                'elements'
            ];
            if (this.get('id')) {
                path.push(this.get('id'));
            }
            return '/' + path.join('/');
        },

        /**
         * Initialise element, get connections
         */
        initialize: function (opts) {
            // Set dataset and visualisation models
            this.dataset = opts.dataset;
            this.visualisation = opts.visualisation;

            // Create collection for elementDimension models
            this.dimensions = new ElementDimensionCollection();

            // Set elementDimension models in collection from "dimensions" attribute
            this.dimensions.set(_.map(this.get('dimensions'), function (d) {
                return _.extend({}, d, {
                    dataset: this.dataset,
                    visualisation: this.visualisation,
                    element: this
                });
            }, this));

            // Reset and init connections.
            this.resetConnections();
        },

        stopConnectionsListeners: function(){
            _.each(this.getConnections(), function (conn) {
                this.stopListening(conn);
            }, this);
        },

        /**
         * Re-initialise element connections.
         */
        resetConnections: function () {
            this.stopConnectionsListeners();
            this.removeConnections();

            // Init connections if element is not hidden
            if (this.get('display') === true) {
                this.initConnections();
                // This will trigger the element rendering if all its
                // connections are loaded; otherwise the element will be
                // rendered by the last call to Element._onSync()
                this.ready();
            }

            return this;
        },

        /**
         * Get dimension field
         */
        _getField: function(index) {
            return this.dataset.fields.get(this.dimensions.at(index || 0).get('field').id);
        },

        /**
         * Emit an event that the element is ready to render
         */
        ready: function() {
            if (this.isLoaded()) {
                this.trigger('element:ready', this);
            }
        },

        /**
         * Emit an event that the element is ready to resize and render
         */
        resize: function() {
            if (this.isLoaded()) {
                this.trigger('element:resize', this);
            }
        },

        /**
         * Handle element feature (bar/point/etc) click
         */
        featureClick: function (d, i) {
            if (this.get('interactive') === false) {
                return false;
            }

            // Check for a valid feature ID
            var observation = this.getObservationById(d.id);
            if (!observation) {
                return false;
            }

            var id = this._getField().get('id'),
                hierarchy = this.dataset.getDimensionHierarchy(id);

            // Non-hierarchical dimension
            if (!hierarchy) {
                if (this.hasCutId(d.id)) {
                    this.removeCut();
                } else {
                    this.addCut(this.buildCutArgs(d.id));
                }

            } else {
                // Hierarchical dimension, handle the drill up/down
                if (this.validParent.test(d.id)) {
                    this.dataset.drillDown(
                        id,
                        observation[hierarchy.level_field],
                        this.validParent.exec(d.id)[0]
                    );
                }
            }

            return true;
        },

        /**
         * Update the element's dimension(s)
         */
        updateDimension: function(id, index) {
            // Remove any cut defined on the current element's dimension.
            // We need this to make sure it's not possible to change a
            // visualisation so that there is no element for a dimension
            // which is included in the current dataset's cut
            if (this.isCut()) {
                this.removeCut(index || 0);
            }

            // Set the element's field ID (and type). We have to
            // unset bucket settings as these are field specific.
            this.dimensions.at(index || 0).set({
                field: this.dataset.fields.get(id).pick('id', 'type'),
                bucket: null,
                bucket_interval: null
            });
        },

        /**
         * Setter for the element's dimensions collection
         *
         * @param dimensions (optional) if not provided, element.dimensions is
         * set to the most appropriate value for this element's type
         */
        updateDimensions: function (dimensions) {
            if (!_.isUndefined(dimensions)) {
                this.dimensions.set(dimensions);
            } else{
                var multidimensional = _.contains(this.elementTypes.multiDimensional, this.get('type')),
                    // rebuild the element's dimensions collection only if the
                    // current one is not appropriate for the element's type
                    // (i.e. we are switching between mono and
                    // multi-dimensional)
                    rebuildDimensions = (multidimensional && this.dimensions.length === 1) ||
                        (!multidimensional && this.dimensions.length > 1);

                if (rebuildDimensions) {
                    var dimensionsCollection = _.map(this.getDimensionFields(), function (model) {
                        return {
                            field: model.pick('id', 'type'),
                            id: model.get('id'),
                            dataset: this.dataset,
                            visualisation: this.visualisation,
                            element: this
                        };
                    }, this);

                    if (multidimensional) {
                        // for multi-dimensional elements, dimensions collection
                        // is built by taking into account all the allowed
                        // dimension fields
                        this.dimensions.set(dimensionsCollection);
                    } else {
                        this.removeCut();

                        // for mono-dimensional elements the dimensions collection
                        // should only contain the first allowed dimension field
                        this.dimensions.reset([_.first(dimensionsCollection)]);
                    }
                }
            }
            this.resetConnections();
        },

        /**
         * Update the element's measure and aggregation
         */
        updateMeasure: function(value) {
            // Get measure
            var measure = value.split(':'),
                field = measure[1],

                // Attributes to update
                attrs = {
                    measure: null,
                    aggregation: measure[0],
                    measure_label: 'Total count of rows'
                };

            if (field) {
                var aggregationType = _.findWhere(this.aggregationTypes, {name: attrs.aggregation});
                attrs.measure = {id: field};
                attrs.measure_label = aggregationType.label +
                    ' ' + this.dataset.fields.get(field).get('label');
            }

            this.set(attrs);
        },

        /**
         * Update the element's (numeric) bucketing
         */
        updateBucketingNumeric: function(value, index) {
            var bucket = (value.length === 0) ? null: parseInt(value, 10),
                bucketInterval = _.isNull(bucket) ? null : 'custom';
            if (bucket === 0) {
                bucket = bucketInterval = null;
            }
            this._updateBucketing(bucket, bucketInterval, index);
        },

        /**
         * Update the element's (date) bucketing
         */
        updateBucketingDate: function(value, index) {
            var bucketInterval = null;
            if (!_.isUndefined(this.bucketIntervals[this.getFieldType()][value])) {
                bucketInterval = value;
            }
            this._updateBucketing(null, bucketInterval, index);
        },

        /**
         * Helper method to update the bucketing settings for a dimension
         */
        _updateBucketing: function(bucket, bucketInterval, index) {
            if(this.isCut()) {
                this.removeCut(index || 0);
            }
            this.dimensions.at(index || 0).set({
                bucket_interval: bucketInterval,
                bucket: bucket
            });
        },

        /**
         * Update a date bucket interval
         */
        updateBucketIntervalDate: function(e) {
            // Get selected bucket interval
            var bucketIntervalSelectVal = $(e.currentTarget).val(),
                fieldType = this.model.getFieldType(),
                bucketInterval = (!_.isUndefined(this.model.bucketIntervals[fieldType][bucketIntervalSelectVal])) ?
                    bucketIntervalSelectVal :
                    null;

            this._updateElementBucketing(null, bucketInterval);
        },

        /**
         * Update a numeric bucket interval
         */
        updateBucketIntervalNumeric: function(e) {
            var bucket = ($(e.currentTarget).val().length === 0) ? null: parseInt($(e.currentTarget).val()),
                 bucketInterval = _.isNull(bucket) ? null : 'custom';

            if (bucket === 0) {
                bucket = bucketInterval = null;
            }

            // Take into account only the first element's dimension.
            // See _updateElementBucketing()
            if (bucket !== this.model.dimensions.at(0).get('bucket')) {
                this._updateElementBucketing(bucket, bucketInterval);
            }
        },

        /**
         * Get the specified observation
         */
        getObservation: function(i, id) {
            return this._getConnection('observations', id).getValue(i);
        },

        /**
         * Get the specified observation
         */
        getObservationById: function(oid, fid) {
            return this._getConnection('observations', fid).getValueById(oid);
        },

        /**
         * Get all observations
         */
        getObservations: function(id) {
            return this._getConnection('observations', id).getData();
        },

        /**
         * Get label dependent on field type
         */
        getLabel: function(value, index) {
            var field = this._getField(index),
                dimension = this.dimensions.at(index || 0);
            switch(field.get('type')) {
                case 'date':
                    return _.extend(value, {
                        label: format.dateLong(value.id, dimension.get('bucket_interval')),
                        label_short: format.dateShort(value.id)
                    });

                case 'integer':
                case 'float':
                    var label = format.num(value.id);
                    if (!_.isUndefined(dimension.get('bucket')) && !_.isNull(dimension.get('bucket'))) {
                        label += ' to ' + format.num(value.id + dimension.get('bucket'));
                    }
                    return _.extend(value, {label: label});

                default:
                case 'string':
                case 'geo':
                    var conn = this._getConnection('dimensions', field.get('id'));
                    if (conn) {
                        var dimensionLabel = conn.getValue(value.id);
                        if (dimensionLabel) {
                            return dimensionLabel;
                        }
                    }
                    // Unknown field or ID
                    return _.extend({label: ''}, value);
            }
        },

        /**
         * Get all labels
         */
        getLabels: function(id) {
           var conn = this._getConnection('dimensions', id);
           if (conn) {
               return conn.getData();
           }
        },

        /**
         * Get extra dimension data
         */
        getDimensionData: function(attribute, id) {
           var conn = this._getConnection('dimensions', id);
           if (conn) {
               return conn.get(attribute);
           }
        },

        /**
         * Get allowed dimension fields for this element type
         */
        getDimensionFields: function() {
            var type = this.get('type');
            if (!(type in this.allowedFields)) {
                type = 'default';
            }
            return this.dataset.fields.filter(this.allowedFields[type]);
        },

        /**
         * Get label for this element's measure
         */
        getMeasureLabel: function () {
            return this.get('measure_label');
        },

        /**
         * Get measure aggregation types
         */
        getAggregationTypes: function() {
            return this.aggregationTypes;
        },

        /**
         * Get dimension field type
         */
        getFieldType: function(index) {
            var field = this._getField(index);
            if (field) {
                return field.get('type');
            }
        },

        /**
         * Get element types
         * @param dimensionality (optional):
         *  - set dimensionality.mono to true to get all the mono-dimensional
         *    elements
         *  - set dimensionality.multi to true to get all the multi-dimensional
         *    elements
         *  - by default both mono and multi-dimensional elements are returned
         */
        getTypes: function (dimensionality) {
            var types = [];
            dimensionality = _.defaults(dimensionality, {mono: true, multi: true });

            if(dimensionality.mono){
                types = types.concat(this.elementTypes.monoDimensional);
            }

            if(dimensionality.multi){
                types = types.concat(this.elementTypes.multiDimensional);
            }

            return types;
        },

        /**
         * Send an "addCut" event which will be handled by the dataset model
         * (see addElement() method in the Visualisation model)
         */
        addCut: function (value, index) {
            this.trigger('addCut', _.object([this._getField(index).get('id')], [value]));
        },

        /**
         * Send a "removeCut" event which will be handled by the dataset model
         * (see addElement() method in the Visualisation model)
         */
        removeCut: function(index) {
            if(!_.isUndefined(index)) {
                this.trigger('removeCut', [this._getField(index).get('id')]);
            }
            else {
                var ids = this.dimensions.map(function (d) { return d.get('field').id; });
                this.trigger('removeCut', ids);
            }
        },

        /**
         * Cut proxy methods
         */
        getCut: function (index) {
            return this.dataset.getCut(this._getField(index).get('id'));
        },

        /**
         * Return true if the specified dimension is cut or if there is only
         * one dimension and it has a cut
         */
        isCut: function (index) {
            if (!_.isUndefined(index) || this.dimensions.size() === 1) {
                return this.dataset.isCut(this._getField(index).get('id'));
            }

            // Return true if any of the element's dimensions are cut
            return _.some(this.dimensions.map(function(d, i) {
                return this.isCut(i);
            }, this));
        },

        hasCutId: function (id, index) {
            return this.dataset.hasCutId(this._getField(index).get('id'), id);
        },

        /**
         * Return true if the dimension is bucketed
         */
        isBucketed: function(index) {
            var dimension = this.dimensions.at(index || 0);
            return (
                (dimension.has('bucket') || dimension.has('bucket_interval')) &&
                _.contains(this.bucketFields, this.getFieldType(index))
            );
        },

        /**
         * Get a serialized representation of element state
         */
        getState: function() {
            return {
                element: this.toJSON(),
                dimensions: this.dimensions.toJSON()
            };
        },

        /**
         * Update element state from the serialized representation returned
         * by getState()
         *
         * Note: the models contained in this.dimensions which are not
         * contained in state.dimensions will be left untouched. This is
         * because we want to keep this method's semantic consistent with
         * Backbone collections' set()
         */
        setState: function(state) {
            this.set(state.element, {silent: false});
            this.dimensions.forEach(function(dimension, index) {
                dimension.set(state.dimensions[index], {silent: true});
            });
        },

        /**
         * Save element and dependent models
         */
        save: function(attrs, opts) {
            opts = _.defaults({success: _.bind(this.saveChildren, this)}, opts);
            return Backbone.Model.prototype.save.call(this, attrs, opts);
        },

        /**
         * Save element's child models (dimensions)
         */
        saveChildren: function(model, response, opts) {
            this.dimensions.save();
        }

    });

    return Element;

});
