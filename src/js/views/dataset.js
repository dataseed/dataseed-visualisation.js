define(['backbone', 'underscore', '../models/dataset', '../models/datasetSingleton', './visualisation'],
    function(Backbone, _, Dataset, datasetSingleton, VisualisationEmbedView) {
    'use strict';

    var DatasetEmbedView = Backbone.View.extend({

        visualisationViewType: VisualisationEmbedView,

        initialize: function(options) {
            // If bootstrap data has been supplied, get as singleton and render
            if (datasetSingleton !== null) {
                this.model = datasetSingleton;
                this.render();

            // If an ID has been supplied, fetch model from server
            } else if (options.id) {
                this.model = new Dataset(options);
                var opts = {success: _.after(2, _.bind(this.render, this))};
                this.model.fetch(opts);
                this.model.visualisation.fetch(opts);

            // No data or ID supplied, error
            } else {
                console.error('No dataset model supplied');
                return;
            }
        },

        /**
         * Render dataset
         */
        render: function() {
            if (!this.visualisation) {
                this.visualisation = new this.visualisationViewType({
                    el: this.el,
                    model: this.model.visualisation,
                    dataset: this.model
                });
            }

            this.model.reset();
            this.visualisation.render();
        }
    });

    return DatasetEmbedView;

});
