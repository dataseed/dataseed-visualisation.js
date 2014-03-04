define(['backbone', 'underscore'],
    function(Backbone, _) {
    'use strict';

    var Element = Backbone.Model.extend({

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

            _.each(this.get('dimensions'), function(opts) {
                if (_.isUndefined(opts['field']['id'])) {
                    return;
                }

                var values = {
                        dimension: opts['field']['id'],
                        bucket: opts['bucket'],
                        measure: this.get('measure')['id'],
                        aggregation: this.get('aggregation')
                    },
                    dimension = this.dataset.pool.getConnection(_.extend({type: 'dimensions'}, values)),
                    observations = this.dataset.pool.getConnection(_.extend({type: 'observations'}, values));

                // Bind to change event
                dimension.bind('change', this.change, this);
                observations.bind('change', this.change, this);

                // Keep references
                this.dimensions.push(dimension);
                this.observations.push(observations);
            }, this);
        },

        isLoaded: function() {
            // Check that isLoaded returns true for every connection
            return _.reduce(this.dimensions, function(memo, conn) {
                return (memo && conn.isLoaded());
            }, true);
        },

        change: function() {
            this.trigger('ready', this);
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
        getLabels: function() {
            return this.dimensions[0].getData();
        },

        getLabel: function(value) {
            return this.dimensions[0].getValue(value.id);
        },

        getObservations: function() {
            return this.observations[0].getData();
        },

        getObservation: function(i) {
            return this.observations[0].getValue(i);
        },

        getTotal: function() {
            return this.observations[0].getTotal();
        },

        getFieldId: function() {
            return this.observations[0].get('dimension');
        },

        getCut: function() {
            return this.dataset.getCut(this.getFieldId());
        },

        isCut: function() {
            return this.dataset.isCut(this.getFieldId());
        },

        hasCutId: function(id) {
            return this.dataset.hasCutId(this.getFieldId(), id);
        },

        hasCutValue: function(i) {
            return this.dataset.hasCutValue(this.getFieldId(), i);
        }

    });

    return Element;

});
