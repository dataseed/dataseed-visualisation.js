define(['backbone', 'underscore'], function (Backbone, _) {
    'use strict';

    var Connection = Backbone.Model.extend({

        apiEndpoint: function () {
            return '/api/datasets/' + this.dataset.get('id') + '/' + this.get('type') + '/';
        },

        url: function () {
            var url = this.apiEndpoint(),
                params = _.extend({}, this.get('cut'), {aggregation: this.get('aggregation')}),

            // Bucket dimensions
                bucket = this.get('bucket'),
                bucket_interval = this.get('bucket_interval');

            if (!_.isNull(this.get('measure'))) {
                params.measure = this.get('measure');
            }

            if (!_.isUndefined(bucket_interval) && !_.isNull(bucket_interval)) {
                params.bucket_interval = bucket_interval;
            }

            if (!_.isUndefined(bucket) && !_.isNull(bucket)) {
                params.bucket = bucket;
            }

            // Build up query parameters
            var urlParams = _.map(params, function (value, key, cut) {
                return key + '=' + value;
            });

            // Add query parameters to URL
            url += '?' + urlParams.join('&');

            return url;
        },

        /**
         * Init
         *
         * Note: this class is not meant to be instantiated directly.
         * Use always the ConnectionPool.getConnection() and
         * ConnectionPool.getConnection() interfaces to handle elements'
         * connections.
         */
        initialize: function (options) {
            // Set dataset model
            this.dataset = options.dataset;

            // Connection's usage count (updated by ConnectionPool)
            this.usage = 0;

            // Trigger our own connection:sync event when the connection model
            // is synched.
            this.listenTo(this, 'sync', function (conn) {
                this.trigger('connection:sync', conn);
            });

            // Fetch
            this.fetch();
        },

        /**
         * Check if data has loaded
         */
        isLoaded: function () {
            return (!_.isUndefined(this.getData()));
        },

        /**
         * Get data
         */
        getData: function () {
            return this.get('total');
        }

    });

    return Connection;

});
