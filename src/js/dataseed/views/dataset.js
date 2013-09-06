define(['backbone', 'underscore', '../models/dataset', '../models/datasetSingleton', './visualisation'],
    function(Backbone, _, Dataset, datasetSingleton, VisualisationEmbedView) {
    'use strict';

    var DatasetEmbedView = Backbone.View.extend({

        visualisationViewType: VisualisationEmbedView,
        visualisationView: null,

        initialize: function(options) {
            // Initialise model
            var loaded = false;

            // If bootstrap data has been supplied, get as singleton
            if (!_.isUndefined(datasetSingleton)) {
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

            // Fetch dataset model
            if (!loaded) {
                this.model.fetch({'success': _.bind(this.initializeVisualisation, this)});
            } else {
                this.initializeVisualisation();
            }
        },

        initializeVisualisation: function() {
            this.visualisationView = new this.visualisationViewType({
                'el': this.el,
                'model': this.model.visualisation,
                'dataset': this.model
            });
            this.render();
        },

        /**
         * Render dataset
         */
        render: function() {
            this.visualisationView.render();
        }

    });

    return DatasetEmbedView;

});
