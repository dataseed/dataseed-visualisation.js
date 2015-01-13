define(['backbone', '../models/visualisation/elementDimension'],
    function (Backbone, ElementDimension) {
        'use strict';

        var ElementDimensionCollection = Backbone.Collection.extend({
            model: ElementDimension,

            /**
             * Save all ElementDimension models in collection
             */
            save: function (attrs, opts) {
                this.invoke('save', attrs, opts);
            }
        });

        return ElementDimensionCollection;

    });
