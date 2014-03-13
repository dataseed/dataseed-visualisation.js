define(['backbone', 'underscore'],
    function(Backbone, _) {
    'use strict';

    var Element = Backbone.Model.extend({

        validParent: /\d+/,

        loaded: 0,

        url: function() {
            return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.visualisation.get('id') + '/elements/' + this.get('id');
        },

        initialize: function(options) {
            this.bind('change', this.change, this);

            // Set dataset and visualisation models
            this.dataset = options['dataset'];
            this.visualisation = options['visualisation'];

            // Get dimensions and observations models
            this.dimensions = [];
            this.observations = [];

            this.fetchObservations = {};

            _.each(this.get('dimensions'), function(opts) {
                if (_.isUndefined(opts['field']['id'])) {
                    return;
                }

                // Set up connections.
                // Given a dataset cut c we ensure that the element’s dimensions'
                // and observations' fetch will omit from c all the dimensions
                // the element is bound to.
                // We apply a similar logic in the addCut() method of the
                // Dataset model as well.

                var values = {
                        dimension: opts['field']['id'],
                        bucket: opts['bucket'],
                        measure: this.get('measure')['id'],
                        aggregation: this.get('aggregation')
                    },

                    dimension = this.dataset.pool.getConnection(_.extend(
                        {
                            type: 'dimensions',
                            'cut': _.omit(this.dataset.cut, opts['field']['id'])
                        }, values)),

                    observations;

                // False if we don't need to fetch observations for this dimension.
                // For a charted dimension this should be always true but for
                // other elements (e.g. filters) we may just want to show the
                // possible element's dimensions values.
                // Note: if observations are not fetched it's up to the backend
                // dimension API returning either only the dimension values that
                // have the at least one match in the current dataset cut or
                // just all the possible values for the dataset dimension.
                this.fetchObservations[opts['field']['id']] = _.isUndefined(opts['fetch_observations']) || (opts['fetch_observations'] === true);

                // Observations are needed only if we need to print totals
                if (this.fetchObservations[opts['field']['id']]) {
                    observations = this.dataset.pool.getConnection(_.extend(
                        {
                            type: 'observations',
                            'cut': _.omit(this.dataset.cut, opts['field']['id'])
                        }, values));
                }

                // Bind to sync event and keep references
                dimension.bind('sync', this.change, this);
                this.dimensions.push(dimension);

                if (!_.isUndefined(observations)) {
                    observations.bind('sync', this.change, this);
                    this.observations.push(observations);
                }

            }, this);
        },

        /**
         * Dataset connection change event handler
         */
        change: function() {
            this.loaded++;
            this.trigger('ready', this);
        },

        /**
         * Return true if all required data has loaded
         */
        isLoaded: function() {
            // Check that all observations and dimensions have completed sync
            // and that isLoaded returns true
            return (
                ((this.loaded % (this.dimensions.length + this.observations.length)) === 0) &&
                _.reduce(this.dimensions.concat(this.observations), function(memo, conn) {
                    return (memo && conn.isLoaded());
                }, true)
            );
        },

        /**
         * Handle element feature (bar/point/etc) click
         */
        featureClick: function(index) {
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

            // Hierarchical dimension, handle the drill up/down
            } else {
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
        addCut: function(value) {
            this.trigger('addCut', _.object([this.getFieldId()], [value]));
        },

        /**
         * Send an "addCut" event
         */
        removeCut: function() {
            this.trigger('removeCut', [this.getFieldId()]);
        },

        /**
         * Get label for this element's measure
         */
        getMeasureLabel: function() {
            return this.get('measure_label');
        },

        /**
         * Proxy methods
         */
        getElementConnection: function (type, dimensionId) {
            // dimensions or observations
            var elementHaystack;
            switch(type){
                case "dimensions":
                    elementHaystack = this.dimensions;
                    break;
                case "observations":
                    elementHaystack = this.observations;
                    break;
                default:
                    return;
            }

            return _.chain(elementHaystack)
                .find(function (connection) {
                    return connection.get('dimension') === dimensionId;
                })
                .value();
        },

        getLabels: function(dimensionId) {
            if(_.isUndefined(dimensionId)){
                return this.dimensions[0].getData();
            }
            var labels,
                dimensionConnection = this.getElementConnection("dimensions", dimensionId);

            if(!_.isUndefined(dimensionConnection)){
                labels = dimensionConnection.getData();
            }

            return labels;
        },

        getLabel: function(value, dimensionId) {
            var label,
                dimensionConnection;

            if (_.isUndefined(dimensionId)) {
                label = this.dimensions[0].getValue(value.id);
            }else{
                dimensionConnection = this.getElementConnection("dimensions", dimensionId);
                if(!_.isUndefined(dimensionConnection)){
                    label = dimensionConnection.getValue(value.id);
                }
            }

            if (_.isUndefined(label)) {
                return _.extend({'label': ''}, value);
            }

            return label;
        },

        getObservations: function(dimensionId) {
            if (_.isUndefined(dimensionId)) {
                return this.observations[0].getData();
            }
            var observationConnection = this.getElementConnection("observations", dimensionId);

            if(_.isUndefined(observationConnection)){
                return;
            }

            return observationConnection.getData();
        },

        getObservation: function(i, dimensionId) {
            if (_.isUndefined(dimensionId)) {
                return this.observations[0].getValue(i);
            }
            var observationConnection = this.getElementConnection("observations", dimensionId);

            if (_.isUndefined(observationConnection)) {
                return;
            }

            return observationConnection.getValue(i);
        },

        getDimensions: function (dimensionId) {
            if (_.isUndefined(dimensionId)) {
                return this.dimensions[0].getData();
            }

            var dimensionConnection = this.getElementConnection("dimensions", dimensionId);
            if (_.isUndefined(dimensionConnection)) {
                return;
            }

            return dimensionConnection.getData();
        },

        getDimension: function (i, dimensionId) {
            if (_.isUndefined(dimensionId)) {
                return this.dimensions[0].getValue(i);
            }

            var dimensionConnection = this.getElementConnection("dimensions", dimensionId);
            if (_.isUndefined(dimensionConnection)) {
                return;
            }
            return dimensionConnection.getValue(i);
        },

        getTotal: function(dimensionId) {
            if (_.isUndefined(dimensionId)) {
                return this.observations[0].getTotal();
            }
            var observationConnection = this.getElementConnection("observations", dimensionId);

            if (_.isUndefined(observationConnection)) {
                return;
            }

            return observationConnection.getTotal();
        },

        getFieldId: function(index) {
            if (_.isUndefined(index)) {
                index = 0;
            }
            return this.get('dimensions')[index].field.id;
        },

        getCut: function(index) {
            return this.dataset.getCut(this.getFieldId(index));
        },

        isCut: function(index) {
            return this.dataset.isCut(this.getFieldId(index));
        },

        hasCutId: function(id, index) {
            return this.dataset.hasCutId(this.getFieldId(index), id);
        },

        hasCutValue: function(i, index) {
            return this.dataset.hasCutValue(this.getFieldId(index), i);
        }

    });

    return Element;

});
