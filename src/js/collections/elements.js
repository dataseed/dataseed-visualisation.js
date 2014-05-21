define(['backbone', '../models/visualisation/element', '../models/visualisation/element/summaryElement'],
    function (Backbone, Element, SummaryElement) {
        'use strict';

        var ElementsCollection = Backbone.Collection.extend({

            // Polymorphic Element models
            // http://backbonejs.org/#Collection-model
            model: function (attrs, options) {

                // Hash to map the visualisation "elements" type attribute values to the
                // proper Element model child objects
                var elementTypes =
                {
                    'summary': SummaryElement
                };

                if (_.isUndefined(elementTypes[attrs.type])) {
                    // Unknown subclass
                    // TODO raise an exception or write a console message?
                    return new Element(attrs, options);
                }

                return new elementTypes[attrs.type](attrs, options);
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
