define(['backbone', 'underscore'],
function (Backbone, _) {
    'use strict';

    var Element = Backbone.Model.extend({

        validParent: /\d+/,

        loaded: 0,

        url: function () {
            return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.visualisation.get('id') + '/elements/' + this.get('id');
        },

        initialize: function (options) {
            this.bind('change', this.change, this);

            // Set dataset and visualisation models
            this.dataset = options['dataset'];
            this.visualisation = options['visualisation'];

            // Get dimensions and observations models
            this.dimensions = [];
            this.observations = [];

            _.each(this.get('dimensions'), function (opts) {
                if (_.isUndefined(opts['field']['id'])) {
                    return;
                }

                var values = {
                        dimension: opts['field']['id'],
                        bucket: opts['bucket'],
                        measure: _.isNull(this.get('measure')) ? null : this.get('measure')['id'],
                        aggregation: this.get('aggregation')
                    },
                    observations = this.dataset.pool.getConnection(_.extend({type: 'observations'}, values)),
                    dimension = this.dataset.pool.getConnection(_.extend({type: 'dimensions'}, values));

                // Bind to sync event and keep references
                observations.bind('sync', this.change, this);
                this.observations.push(observations);

                dimension.bind('sync', this.change, this);
                this.dimensions.push(dimension);
            }, this);
        },

        /**
         * Dataset connection change event handler
         */
        change: function () {
            this.loaded++;
            this.trigger('ready', this);
        },

        /**
         * Return true if all required data has loaded
         */
        isLoaded: function () {
            // Check that all observations and dimensions have completed sync
            // and that isLoaded returns true

            var dimensionsToUpdate = _.filter(this.dimensions, function (d) {
                var datasetField = this.dataset.fields.get(d.get('dimension'));

                // A dimension is fetched at least once.
                // When a cut is added/removed, a dimension it is updated
                // (re-fetched) only if the "update_dimension" field's attribute
                // is true
                return (!d.isLoaded() || (datasetField.get('update_dimension') === true));
            }, this);

            return (
                ((this.loaded % (dimensionsToUpdate.length + this.observations.length)) === 0) &&
                    _.reduce(this.dimensions.concat(this.observations), function (memo, conn) {
                        return (memo && conn.isLoaded());
                    }, true)
                );
        },

        /**
         * Handle element feature (bar/point/etc) click
         */
        featureClick: function (index) {
            if (this.get('interactive') === false) {
                return false;
            }

            var dimension = this.getFieldId(),
                hierarchy = this.dataset.getDimensionHierarchy(dimension),
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
                var level = observation[hierarchy['level_field']];
                if (this.validParent.test(observation.id)) {
                    this.dataset.drillDown(dimension, level, this.validParent.exec(observation.id)[0]);
                }
            }

            return true;
        },

        /**
         * Send an "addCut" event for th
         */
        addCut: function (value) {
            this.trigger('addCut', _.object([this.getFieldId()], [value]));
        },

        /**
         * Send an "addCut" event
         */
        removeCut: function () {
            this.trigger('removeCut', [this.getFieldId()]);
        },

        /**
         * Get label for this element's measure
         */
        getMeasureLabel: function () {
            return this.get('measure_label');
        },

        /**
         * Get allowed chart types for this element's dimension
         */
        getChartTypes: function() {
            var field = this.dataset.fields.get(this.getFieldId());
            return _.pluck(field.get('charts'), 'type');
        },

        /**
         * Returns an element connection
         * @param type connection type. Possibile values: "dimensions" or "observations"
         * @param dimensionId the dimension id of the connection we want to get
         * if undefined, the first element of the dimensions/observations
         * connection is returned
         * @returns an Element connection
         */
        getElementConnection: function (type, dimensionId) {
            if (!_.isUndefined(this[type])) {
                if (_.isUndefined(dimensionId)) {
                    return this[type][0];
                }
                return _.find(this[type], function (conn) {
                    return conn.get('dimension') === dimensionId;
                });
            }
        },

        /**
         * Proxy methods
         */
        getElementConnectionData: function (type, dimensionId) {
            var conn = this.getElementConnection(type, dimensionId);

            if (!_.isUndefined(conn)) {
                return conn.getData();
            }
        },

        getLabels: function (dimensionId) {
            return this.getElementConnectionData("dimensions", dimensionId);
        },

        getLabel: function (value, dimensionId) {
            var label = _.extend({'label': ''}, value),
                conn = this.getElementConnection("dimensions", dimensionId);

            if (!_.isUndefined(conn) && !_.isUndefined(conn.getValue(value.id))) {
                label = conn.getValue(value.id);
            }

            return label;
        },

        getObservations: function (dimensionId) {
            return this.getElementConnectionData("observations", dimensionId);
        },

        getObservation: function (i, dimensionId) {
            var conn = this.getElementConnection("observations", dimensionId);

            if (!_.isUndefined(conn)) {
                return conn.getValue(i);
            }
        },

        getDimension: function (i, dimensionId) {
            var conn = this.getElementConnection("dimensions", dimensionId);

            if (!_.isUndefined(conn)) {
                return conn.getValue(i);
            }
        },

        getTotal: function (dimensionId) {
            var conn = this.getElementConnection("observations", dimensionId);

            if (!_.isUndefined(conn)) {
                return conn.getTotal();
            }
        },

        getFieldId: function (index) {
            if (_.isUndefined(index)) {
                index = 0;
            }
            return this.get('dimensions')[index].field.id;
        },

        getCut: function (index) {
            return this.dataset.getCut(this.getFieldId(index));
        },

        isCut: function (index) {
            return this.dataset.isCut(this.getFieldId(index));
        },

        hasCutId: function (id, index) {
            return this.dataset.hasCutId(this.getFieldId(index), id);
        },

        hasCutValue: function (i, index) {
            return this.dataset.hasCutValue(this.getFieldId(index), i);
        }

    });

    return Element;

});
