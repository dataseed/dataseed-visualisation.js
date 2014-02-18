define(['backbone', 'underscore', '../models/dataset', '../models/datasetSingleton', './visualisation'],
    function(Backbone, _, Dataset, datasetSingleton, VisualisationEmbedView) {
    'use strict';

    var DatasetEmbedView = Backbone.View.extend({

        visualisationViewType: VisualisationEmbedView,
        visualisation: null,

        initialize: function(options) {
            // Initialise model
            var loaded = false;

            // If bootstrap data has been supplied, get as singleton
            if (!_.isNull(datasetSingleton)) {
                this.model = datasetSingleton;
                loaded = true;

            // If an ID has been supplied, fetch model from server
            } else if (!_.isUndefined(options['id'])) {
                this.model = new Dataset(options);

            // No data or ID supplied, error
            } else {
                console.log('No dataset model supplied');
                return;
            }

            // Fetch models or render
            if (!loaded) {
                var opts = {'success': _.after(2, _.bind(this.render, this))};
                this.model.fetch(opts);
                this.model.visualisation.fetch(opts);
            } else {
                this.render();
            }
        },

        /**
         * Render dataset
         */
        render: function() {
            if (_.isNull(this.visualisation)) {
                this.visualisation = new this.visualisationViewType({
                    'el': this.el,
                    'model': this.model.visualisation,
                    'dataset': this.model
                });
            }

            this.visualisation.render();
        }

    });

    return DatasetEmbedView;

});
