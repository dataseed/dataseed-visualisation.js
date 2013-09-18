define(['backbone', 'underscore', '../collections/elements'],
    function(Backbone, _, ElementsCollection) {
    'use strict';

    var Visualisation = Backbone.Model.extend({

        MAX_ELEMENTS: 100,

        url: function() {
            return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.get('id');
        },

        initialize: function() {
            this.elements = new ElementsCollection();
            this.elements.bind('add', this.addElement, this);
            this.elements.bind('reset', this.updateElementOrder, this);
        },

        addElement: function(element) {
            element.bind('addCut', this.addCut, this);
            element.bind('removeCut', this.removeCut, this);
        },

        resetElements: function() {
            // Set element models in collection from visualisation "elements" attribute
            this.elements.set(_.map(this.get('elements'), function(element) {

                var defaults = {
                    'visualisation': this,
                    'dataset': this.dataset,
                    'defaultCut': this.get('defaultCut')
                };
                return _.extend(defaults, element);
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

        addCut: function(key, value) {
            this.elements.invoke('setCut', key, value);
        },

        removeCut: function(key) {
            this.elements.invoke('unsetCut', key);
        }

    });

    return Visualisation;

});
