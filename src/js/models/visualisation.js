define(['backbone', 'underscore', '../collections/elements', '../collections/styles'],
    function (Backbone, _, ElementsCollection, StylesCollection) {
    'use strict';

    var Visualisation = Backbone.Model.extend({

        MAX_ELEMENTS: 100,

        url: function () {
            return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.get('id');
        },

        /**
         * Initialise visualisation model
         */
        initialize: function (options) {
            // Set dataset
            this.dataset = options.dataset;

            // Create collection for element models
            this.elements = new ElementsCollection();
            this.elements.bind('add', this.addElement, this);
            this.elements.bind('reset', this.updateElementOrder, this);

            // Create collection for style models
            this.styles = new StylesCollection(null, {visualisation: this});
        },

        /**
         * Handle element "add" event
         */
        addElement: function (element) {
            element.bind('addCut', this.dataset.addCut, this.dataset);
            element.bind('removeCut', this.dataset.removeCut, this.dataset);
        },

        /**
         * Build dependent element and style models from visualisation's attributes
         */
        reset: function () {
            // Set model defaults
            var defaults = {
                dataset: this.dataset,
                visualisation: this
            };

            // Set element models in collection from visualisation "elements" attribute
            this.elements.set(_.map(this.get('elements'), function (element) {
                return _.extend({}, defaults, element);
            }, this));

            // Set style models in collection from visualisation "styles" attribute
            this.styles.set(_.map(this.get('styles'), function (element) {
                return _.extend({}, defaults, element);
            }, this));
        },

        /**
         * Update "weight" values for this visualisation's elements to ensure that
         * they're sequential and don't exceed the largest allowed "weight" value
         */
        updateElementOrder: function () {
            // Start from current largest weight
            var offsetElement = this.elements.max(function (element) {
                    return element.get('weight');
                }),
                offset = offsetElement.get('weight');

            // Reset to 0 if we're going to exceed the size of the weight field
            if ((offset + this.elements.size()) >= this.MAX_ELEMENTS) {
                offset = 0;
            }

            // Update element weights
            this.elements.forEach(function (element, index) {
                element.set('weight', offset + index + 1, {silent: true});
            });
        },

        /**
         * Save visualisation and dependent models
         */
        save: function(attrs, opts) {
            opts = _.defaults({success: _.bind(this.saveChildren, this)}, opts);
            return Backbone.Model.prototype.save.call(this, attrs, opts);
        },

        /**
         * Save element's child models (elements and styles)
         */
        saveChildren: function(model, response, opts) {
            this.elements.save();
            this.styles.save();
        },

        /**
         * Builds the most appropriate element's dimensions depending on its
         * type:
         * - if the element is mono-dimensional, the element dimension is set
         *   to the first dataset's field
         * - otherwise the element's dimensions will take into account either
         *   all the dataset's fields or all the dataset's string fields
         *   depending on whether, respectively, the element type is summary
         *   or navigation
         *
         *   @returns an Array of element's dimensions attributes
         */
        defaultElementDimensions: function (type) {
            return _.compact(this.dataset.fields.map(function (field, index) {
                if ((index < 1 && type !== 'navigation') ||
                    (type === 'summary') ||
                    (type === 'navigation' && field.get('type') === 'string')) {
                    return {
                        id: field.get('id'),
                        field: field.pick('id', 'type'),
                        weight: index
                    };
                }
            }));
        }

    });

    return Visualisation;

});
