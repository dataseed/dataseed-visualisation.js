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
         * Handle element feature (bar/point/etc) click
         */
        featureClick: function (index) {
            if (this.get('interactive') === false) {
                return false;
            }

            var hierarchy = this.dataset.getDimensionHierarchy(this._getField().get('id')),
                observation = this.getObservation(index);

            // Non-hierarchical dimension
            if (_.isUndefined(hierarchy)) {
                if (this.hasCutId(observation.id)) {
                    this.removeCut();
                } else {
                    this.addCut(observation.id);
                }
            } else {
                // Hierarchical dimension, handle the drill up/down
                var level = observation[hierarchy.level_field];
                if (this.validParent.test(observation.id)) {
                    this.dataset.drillDown(dimension, level, this.validParent.exec(observation.id)[0]);
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
                        date = new Date(value.id);

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
         * Get label for this element's measure
         */
        getMeasureLabel: function () {
            return this.get('measure_label');
        },

        /**
         * Get dimension field type
         */
        getFieldType: function(index) {
            return this._getField(index).get('type');
        },

        /**
         * Get dimension field chart types
         */
        getChartTypes: function(index) {
            return _.pluck(this._getField(index).get('charts'), 'type');
        },

        /**
         * Send an "addCut" event for th
         */
        addCut: function (value, index) {
            this.trigger('addCut', _.object([this._getField(index).get('id')], [value]));
        },

        /**
         * Send an "addCut" event
         */
        removeCut: function(index) {
            this.trigger('removeCut', [this._getField(index).get('id')]);
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
        },

        hasCutValue: function (i, index) {
            return this.dataset.hasCutValue(this._getField(index).get('id'), i);
        }

    });

    return Element;

});
