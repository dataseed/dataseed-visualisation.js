define(['backbone', 'underscore', './connection'],
    function (Backbone, _, Connection) {
    'use strict';

    var DimensionalConnection = Connection.extend({

        apiEndpoint: function () {
            return '/api/datasets/' + this.dataset.get('id') + '/' + this.get('type') + '/' + this.get('dimension');
        },

        /**
         * Get sum of observation values
         */
        getSum: function() {
            return _.reduce(this.get(this.get('dimension')), function(i, d) {
                return i + d.total;
            }, 0);
        },

        /**
         * Get observation value as ratio
         */
        getRatio: function(total, d) {
            return _.extend({}, d, {total: d.total / total});
        },

        /**
         * Get data
         */
        getData: function(format, sort, sort_direction) {
            var data = this.get(this.get('dimension'));

            // Use percentages
            if (format === 'percentage') {
                data = _.map(data, _.partial(this.getRatio, this.getSum()));
            }

            // Sort
            if (sort) {
                data = _.sortBy(data, sort);

                // Sort direction
                if (sort_direction === 'desc') {
                    data = data.reverse();
                }
            }

            return data;
        },

        /**
         * Get the specified value
         */
        getValue: function(i, format) {
            return this.getData(format)[i];
        },

        /**
         * Get the specified value by ID
         */
        getValueById: function(id, format) {
            return _.findWhere(this.getData(format), {id: id});
        },

        /**
         * Get data ids
         */
        getDataIds: function() {
            return _.pluck(this.getData(), 'id');
        }
    });

    return DimensionalConnection;

});
