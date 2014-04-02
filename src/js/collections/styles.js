define(['backbone', '../models/visualisation/style'],
        function(Backbone, Style) {
    'use strict';

    var StylesCollection = Backbone.Collection.extend({

        model: Style,

        defaults: {
            'background':           '#fff',
            'heading':              '#555',
            'featureFill':          '#089fd8',
            'featureFillActive':    '#c8c8c8',
            'featureStroke':        '#fff',
            'featureStrokeActive':  '#fff',
            'label':                '#fff',
            'scaleFeature':         '#555',
            'scaleLabel':           '#555',
            'measureLabel':         '#555',
            'choroplethMin':        '#fff',
            'choroplethMax':        '#000'
        },

        initialize: function(models, options) {
            // Set visualisation model
            this.visualisation = options['visualisation'];
        },

        /*
         * Get a CSS style value
         */
        getStyle: function (type, element, d, i) {
            // If this is a feature, check if it's active
            if (type.substring(0, 7) === 'feature' &&
                !_.isUndefined(element) &&
                !_.isUndefined(i) &&
                element.isCut() &&
                !element.hasCutValue(i)) {
                type += 'Active';
            }

            var style = this.get(type);
            if (!_.isUndefined(style)) {
                return style.get('value');
            }

            // Use default style
            return this.defaults[type];
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
                    this.addStyle(key, value);
                }
            }, this);

            // Trigger render
            this.trigger('ready');
        },

        /**
         * Add style model to collection
         */
        addStyle: function(id, value) {
            var style = new Style({
                'dataset': this.visualisation.dataset,
                'visualisation': this.visualisation,
                'id': id,
                'value': value
            });
            this.add(style);
        },

        /**
         * Save all styles in collection
         */
        save: function(attrs, opts) {
            this.invoke('save', attrs, opts);
        }

    });

    return StylesCollection;

});
