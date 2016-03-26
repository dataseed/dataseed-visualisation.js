define(['backbone', 'underscore', 'jquery', 'd3', '../../lib/format', '../dataset/field', '../../collections/elementDimensions'],
function (Backbone, _, $, d3, format, Field, ElementDimensionCollection) {
    'use strict';

    /**
     * Abstract base class for element models
     *
     * Derived models should implement:
     * - isLoaded: Returns a boolean indicating whether the element can be rendered
     * - isCut: Returns a boolean indicating whether the element has a cut
     */
    var Element = Backbone.Model.extend({

        /**
         * Get element model URL
         */
        url: function() {
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
         * Initialise element
         */
        initialize: function(opts) {
            // Set dataset and visualisation models
            this.dataset = opts.dataset;
            this.visualisation = opts.visualisation;

            // Create element settings model
            this.set('settings', new Backbone.Model(this.get('settings')));
        },

        /**
         * Parse model
         */
        parse: function(response) {
            if (response.settings) {
                response.settings = this.get('settings')
                    .clear({silent: true})
                    .set(response.settings);
            }
            return response;
        },

        /**
         * Serialize model
         */
        toJSON: function() {
            // Get model attributes
            var data = Backbone.Model.prototype.toJSON.apply(this, arguments);

            // Get settings model attributes
            data.settings = data.settings.toJSON();

            // Create deep copy (ignoring references to dataset and visualisation models)
            return _.clone(_.omit(data, 'dataset', 'visualisation'), true);
        },

        /**
         * Get a serialized representation of element state
         */
        getState: function() {
            return JSON.stringify(this.toJSON());
        },

        /**
         * Update element state from the serialized representation returned
         * by getState()
         */
        setState: function(state) {
            this.set(this.parse(JSON.parse(state)), {silent: false});
        }

    });

    return Element;

});
