define(['backbone', 'underscore', '../models/visualisation/element/measureElement', '../models/visualisation/element/dimensionalElement'],
function (Backbone, _, MeasureElement, DimensionalElement) {
    'use strict';

    var elementTypes = {
        summary: MeasureElement
    };

    var ElementsCollection = Backbone.Collection.extend({

        /**
         * Polymorphic Element models
         * http://backbonejs.org/#Collection-model
         */
        model: function (attrs, opts) {
            if (_.isUndefined(elementTypes[attrs.type])) {
                return new DimensionalElement(attrs, opts);
            }
            return new elementTypes[attrs.type](attrs, opts);
        },

        /**
         * Save all elements in collection
         */
        save: function (attrs, opts) {
            this.invoke('save', attrs, opts);
        },

        /**
         * Get a serialized representation of elements' state
         */
        getState: function() {
            return this.invoke('getState');
        },

        /**
         * Update elements' state from serialized representations returned by getState()
         */
        setState: function(states) {
            _.each(states, function(state) {
                var model = this.get(state.element.id);
                model.setState(state);
                model.resetConnections();
            }, this);
        }

    });

    return ElementsCollection;

});
