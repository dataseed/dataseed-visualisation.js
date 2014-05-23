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
        },

        /**
         * Sum the values for this dimension
         */
        getTotal: function() {
            var dimension = this.get('dimension'),
                currentCut = null;
            if (this.dataset.isCut(dimension)) {
                currentCut = this.dataset.getCut(dimension);
            }
            return _.reduce(this.getData(), function(m, v) {
                if (currentCut === null || currentCut === v.id) {
                    return m + v.total;
                }
                return m;
            }, 0);
        }

    });

    return DimensionalConnection;

});
