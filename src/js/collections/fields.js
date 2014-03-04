define(['backbone', '../models/dataset/field'],
        function(Backbone, Field) {
    'use strict';

    var FieldsCollection = Backbone.Collection.extend({
        model: Field
    });

    return FieldsCollection;

});
