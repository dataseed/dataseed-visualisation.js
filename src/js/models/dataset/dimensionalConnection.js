define(['backbone', 'underscore', './connection'],
    function (Backbone, _, Connection) {
    'use strict';

    var DimensionalConnection = Connection.extend({

        apiEndpoint: function () {
            return '/api/datasets/' + this.dataset.get('id') + '/' + this.get('type') + '/' + this.get('dimension');
        },

        /**
         * Get data
         */
        getData: function() {
            return this.get(this.get('dimension'));
        },

        /**
         * Get the specified value
         */
        getValue: function(k) {
            return this.getData()[k];
        }

    });

    return DimensionalConnection;

});
