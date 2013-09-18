define(['backbone', 'underscore', './visualisation'],
    function(Backbone, _, Visualisation) {
    'use strict';

    var Dataset = Backbone.Model.extend({

        url: function() {
            return '/api/datasets/' + this.get('id');
        },

        /**
         * Initialise dataset's visualisation model
         */
        initialize: function(options) {
            var loaded = false;

            // Check if visualisation was supplied in model data
            if (!_.isUndefined(options['visualisations']) && !_.isUndefined(options['visualisations'][0])) {
                this.visualisation = new Visualisation(options['visualisations'][0]);
                loaded = true;

            // Check if visualisation ID was supplied
            } else if (!_.isUndefined(options['visualisation_id'])) {
                this.visualisation = new Visualisation({
                    'id': options['visualisation_id']
                });

            } else {
                console.log('No visualisation model supplied');
                return;
            }

            // Set dataset
            this.visualisation.dataset = this;

            // Set default cut
            if (!_.isUndefined(options['cut'])) {
                this.visualisation.set('defaultCut', options['cut'], {'silent': true});
            }

            // Fetch model if not already loaded
            if (!loaded) {
                this.visualisation.fetch();
            }
        },

        /**
         * Get all dataset fields that can be used as measures
         */
        getMeasureFields: function() {
            return _(this.get('fields')).filter(function(field) {
                return (_.isArray(field['aggregations']) && field['aggregations'].length > 0);
            });
        },

        /**
         * Get allowed chart types for the specified field
         */
        getChartTypes: function(id) {
            var field = _(this.get('fields')).findWhere({'id': id});
            if (!_.isUndefined(field) && !_.isUndefined(field['charts'])) {
                return _(field['charts']).pluck('type');
            }
            return [];
        }

    });

    return Dataset;

});
