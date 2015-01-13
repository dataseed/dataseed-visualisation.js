define(['backbone', 'underscore'],
    function (Backbone, _) {
    'use strict';

    var ElementDimension = Backbone.Model.extend({

        url: function () {
            return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.visualisation.get('id') + '/elements/' + this.element.get('id') + '/dimensions/' + this.get('id');
        },

        initialize: function (options) {
            // Set dataset, visualisation and element models
            this.dataset = options['dataset'];
            this.visualisation = options['visualisation'];
            this.element = options['element'];
        }

    });

    return ElementDimension;

    });
