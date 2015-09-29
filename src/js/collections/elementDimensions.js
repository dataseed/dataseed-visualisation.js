define(['backbone', '../models/visualisation/elementDimension'],
    function (Backbone, ElementDimension) {
        'use strict';

        var ElementDimensionCollection = Backbone.Collection.extend({
            model: ElementDimension
        });

        return ElementDimensionCollection;

    });
