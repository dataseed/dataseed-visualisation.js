define(['backbone', 'underscore', '../models/visualisation/style'],
    function(Backbone, _, Style) {
    'use strict';

    var StylesCollection = Backbone.Collection.extend({

        model: Style,

        defaults: {
            'visualisationBackground':  '#f5f6f9',
            'background':               '#fff',
            'heading':                  '#555',
            'featureFill':              '#4972bd',
            'featureFillActive':        '#88939d',
            'featureStroke':            '#fff',
            'featureStrokeActive':      '#fff',
            'label':                    '#fff',
            'scaleFeature':             '#555',
            'scaleLabel':               '#555',
            'measureLabel':             '#555',
            'choroplethMin':            '#fff',
            'choroplethMax':            '#000',
            'choroplethStroke':         '#000',
            'choroplethStrokeWidth':    '1'
        },

        initialize: function(models, options) {
            // Set visualisation model
            this.visualisation = options.visualisation;
        },

        /*
         * Lookup a CSS style value given its identifier
         */
        lookupStyle: function (type) {
            var style = this.get(type);
            if (!_.isUndefined(style)) {
                return style.get('value');
            }

            // Use default style
            return this.defaults[type];
        },

        /*
         * Get the more appropriate CSS style value for a feature
         */
        getStyle: function (type, element, d, i) {
            // If this is a feature, check if it's active
            var activeFeature = (
                    type.substring(0, 7) === 'feature' &&
                    !_.isUndefined(element) &&
                    !_.isUndefined(d) &&
                    element.isCut() &&
                    !element.hasCutId(d.id)
                );

            type += (activeFeature) ? 'Active' : '';
            return this.lookupStyle(type);
        },

        /*
         * Set one or more CSS style values
         */
        setStyles: function(updates) {
            // Add/update style models
            _.each(updates, function(value, key) {
                var style = this.get(key);
                if (!_.isUndefined(style)) {
                    // Update existing
                    style.set('value', value);
                } else {
                    // Create new
                    this.add({
                        id: key,
                        value: value,
                        dataset: this.visualisation.dataset,
                        visualisation: this.visualisation
                    });
                }
            }, this);

            // Trigger render
            this.trigger('ready');
        },

        /**
         * Save all styles in collection
         */
        save: function(attrs, opts) {
            this.invoke('save', attrs, opts);
        },

        /**
         * Get a serialized representation of styles' state
         */
        getState: function() {
            return this.models.map(function(model) {
                return {id: model.get('id'), value: model.get('value')};
            });
        },

        /**
         * Update styles' state from serialized representations returned by getState()
         * Set any other styles models back to their default state
         */
        setState: function(states) {
            // Update models
            this.models.forEach(function(model) {
                var id = model.get('id'),
                    state = _.findWhere(states, {id: id});
                model.set('value', (state) ? state.value : this.defaults[id]);
            }, this);

            // Trigger render
            this.trigger('ready');
        }

    });

    return StylesCollection;

});
