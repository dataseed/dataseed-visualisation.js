define(['backbone', 'underscore', '../collections/elements', '../collections/styles'],
    function(Backbone, _, ElementsCollection, StylesCollection) {
    'use strict';

    var Visualisation = Backbone.Model.extend({

        MAX_ELEMENTS: 100,

        url: function() {
            return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.get('id');
        },

        initialize: function() {
            // Create collection for element models
            this.elements = new ElementsCollection();
            this.elements.bind('add', this.addElement, this);
            this.elements.bind('reset', this.updateElementOrder, this);

            // Create collection for style models
            this.styles = new StylesCollection(null, {'visualisation': this});
        },

        addElement: function(element) {
            element.bind('addCut', this.addCut, this);
            element.bind('removeCut', this.removeCut, this);
        },

        reset: function() {
            // Set model defaults
            var defaults = {
                'dataset': this.dataset,
                'visualisation': this,
                'defaultCut': this.get('defaultCut')
            };

            // Set element models in collection from visualisation "elements" attribute
            this.elements.set(_.map(this.get('elements'), function(element) {
                return _.extend({}, defaults, element);
            }, this));

            // Set style models in collection from visualisation "styles" attribute
            this.styles.set(_.map(this.get('styles'), function(element) {
                return _.extend({}, defaults, element);
            }, this));
        },

        updateElementOrder: function() {
            // Start from current largest weight
            var offsetElement = this.elements.max(function(element) {
                    return element.get('weight');
                }),
                offset = offsetElement.get('weight');

            // Reset to 0 if we're going to exceed the size of the weight field
            if ((offset + this.elements.size()) >= this.MAX_ELEMENTS) {
                offset = 0;
            }

            // Update element weights
            this.elements.forEach(function(element, index) {
                element.set('weight', offset + index + 1, {'silent': true});
            });
        },

        addCut: function(cut) {
            this.elements.invoke('setCut', cut);
        },

        removeCut: function(keys) {
            this.elements.invoke('unsetCut', keys);
        }

    });

    return Visualisation;

});
