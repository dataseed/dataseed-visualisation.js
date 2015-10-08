define(['backbone', 'underscore'],
    function (Backbone, _) {
    'use strict';

    var ElementDimension = Backbone.Model.extend({

        /**
         * Set dataset, visualisation and element models
         */
        initialize: function (options) {
            this.dataset = options.dataset;
            this.visualisation = options.visualisation;
            this.element = options.element;
        },

        /**
         * Remove referenced models from serialized representation
         */
        toJSON: function() {
            return _.omit(
                Backbone.Model.prototype.toJSON.apply(this, arguments),
                'dataset', 'visualisation', 'element'
            );
        }

    });

    return ElementDimension;

    });
