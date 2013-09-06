define(['backbone', '../models/element'],
        function(Backbone, Element) {
    'use strict';

    var ElementsCollection = Backbone.Collection.extend({

        model: Element,

        /**
         * Save all elements in collection
         */
        save: function(attrs, opts) {
            this.invoke('save', attrs, opts);
        }

    });

    return ElementsCollection;

});
