define(['backbone', '../models/visualisation/element/measure', '../models/visualisation/element/dimensions'],
function (Backbone, MeasureElement, DimensionsElement) {
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
                return new DimensionsElement(attrs, opts);
            }
            return new elementTypes[attrs.type](attrs, opts);
        },

        /**
         * Save all elements in collection
         */
        save: function (attrs, opts) {
            this.invoke('save', attrs, opts);
        }

    });

    return ElementsCollection;

});
