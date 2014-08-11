define(['backbone', 'underscore', '../../lib/format'],
function (Backbone, _, format) {
    'use strict';

    /**
     * Abstract base class for element models
     *
     * Derived classes should implement:
     *      initConnections(opts)
     *      isLoaded()
     *      _onSync()
     *      _getField([index])
     *      _getConnection(type, [id])
     *      buildCutArgs(cutValue, index)
     *
     * Derived elements are supposed to store their connections in either
     * this._connections or this._connection which have both to be meant as
     * 'protected' instance properties.
     *
     */
    var Element = Backbone.Model.extend({

        // Regex to test for a valid parent property name in a hierarchical dimension
        validParent: /\d+/,

        // Field types that have an associated dimension connection model.
        // For the other types (basically numeric and dates) it makes sense to
        // use observation values as labels - see this.getLabel().
        dimensionFields: ['string', 'geo'],

        // Field types whose values could be bucketed. We need to keep track of
        // them because for those fields cut values should be defined by ranges
        // of values
        bucketFields: ['date'],

        url: function () {
            return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.visualisation.get('id') + '/elements/' + this.get('id');
        },

        /**
         * Re-initialise element connections.
         */
        resetConnections: function () {
            if(this._connections){
                delete this._connections;
            }

            if(this._connection){
                delete this._connection;
            }

            // Init connections if element is not hidden
            if (this.get('display') === true) {
                this.initConnections();
                this.ready();
            }
        },

        /**
         * Initialise element, get connections
         */
        initialize: function (opts) {
            // Set dataset and visualisation models
            this.dataset = opts.dataset;
            this.visualisation = opts.visualisation;

            // Get dimension(s) field model(s)
            this._fields = _.map(this.get('dimensions'), function(dimension) {
                return this.dataset.fields.get(dimension.field.id);
            }, this);

            // Reset and init connections.
            this.resetConnections();
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
            var field = this._getField(index);
            switch(field.get('type')) {
                case 'date':
                    var dimensionIndex = index || 0,
                        dimension = this.get('dimensions')[dimensionIndex],
                        date = new Date(value.id),
                        milliPerMin = 60000;

                    // Removing the user's local timezone and converting it to GMT
                    date = new Date(date.valueOf() + date.getTimezoneOffset() * milliPerMin);

                    return _.extend(value, {
                        label: format.dateLong(date, dimension.bucket_interval),
                        label_short: format.dateShort(date)
                    });

                case 'integer':
                case 'float':
                    return _.extend(value, {
                        label: format.num(value.id)
                    });

                default:
                case 'string':
                case 'geo':
                    var conn = this._getConnection('dimensions', field.get('id'));
                    if (conn) {
                        var label = conn.getValue(value.id);
                        if (label) {
                            return label;
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
         * Get label for this element's measure
         */
        getMeasureLabel: function () {
            return this.get('measure_label');
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
         * Get dimension field chart types
         */
        getChartTypes: function(index) {
            var field = this._getField(index);
            if (field) {
                return _.pluck(field.get('charts'), 'type');
            }
            return [];
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
                var ids = _.map(this.get('dimensions'), function (d) { return d.field.id; });
                this.trigger('removeCut', ids);

            }
        },

        /**
         * Cut proxy methods
         */
        getCut: function (index) {
            return this.dataset.getCut(this._getField(index).get('id'));
        },

        isCut: function (index) {
            return this.dataset.isCut(this._getField(index).get('id'));
        },

        hasCutId: function (id, index) {
            return this.dataset.hasCutId(this._getField(index).get('id'), id);
        }

    });

    return Element;

});
