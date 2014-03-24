define(['backbone', 'underscore'],
    function(Backbone, _) {
    'use strict';

    var Style = Backbone.Model.extend({

        url: function() {
            return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.visualisation.get('id') + '/styles/' + this.get('id');
        },

        initialize: function(options) {
            // Set dataset and visualisation models
            this.dataset = options['dataset'];
            this.visualisation = options['visualisation'];
        }

    });

    return Style;

});
