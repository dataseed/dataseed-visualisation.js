define(['backbone', 'underscore'], function (Backbone, _) {
    'use strict';

    var Connection = Backbone.Model.extend({

        apiEndpoint: function () {
            return '/api/datasets/' + this.dataset.get('id') + '/' + this.get('type') + '/';
        },

        url: function () {
            var url = this.apiEndpoint(),
                params = _.extend({}, this.get('cut'), {aggregation: this.get('aggregation')});

            if (this.get('measure')) {
                params.measure = this.get('measure');
            }

            if (!_.isUndefined(this.get('bucket_interval')) && !_.isNull(this.get('bucket_interval'))) {
                params.bucket_interval = this.get('bucket_interval');
            }

            if (!_.isUndefined(this.get('bucket')) && !_.isNull(this.get('bucket'))) {
                params.bucket = this.get('bucket');
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
            this.listenTo(this, 'sync', _.bind(this.trigger, this, 'connection:sync'));

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
