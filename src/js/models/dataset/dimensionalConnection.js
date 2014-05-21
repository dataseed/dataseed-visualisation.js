define(['backbone', 'underscore', './connection'],
        function (Backbone, _, Connection) {
    'use strict';

    var dimensionalConnection = Connection.extend({

        url: function() {
            var url = '/api/datasets/' + this.dataset.get('id') + '/' + this.get('type') + '/' + this.get('dimension'),
                params = _.extend({}, this.get('cut'), {'aggregation': this.get('aggregation')});

            if (!_.isNull(this.get('measure'))) {
                params['measure'] = this.get('measure');
            }

            // Bucket dimensions
            var bucket = this.get('bucket');
            if (this.get('type') == 'dimensions' && !_.isUndefined(bucket) && !_.isNull(bucket)) {
                params['bucket'] = bucket;
            }

            // Add cut to query parameters
            var urlParams = _.map(params, function (value, key, cut) { return key + '=' + value; });

            // Add query parameters to URL
            url += '?' + urlParams.join('&');

            return url;
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

    return dimensionalConnection;

});
