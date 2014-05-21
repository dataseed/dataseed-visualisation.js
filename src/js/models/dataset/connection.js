define(['backbone', 'underscore'],
        function(Backbone, _) {
    'use strict';

    var Connection = Backbone.Model.extend({

        url: function() {
            var url = '/api/datasets/' + this.dataset.get('id') + '/' + this.get('type') + '/',
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
         * Init
         */
        initialize: function(options) {
            // Set dataset model
            this.dataset = options['dataset'];

            // Fetch
            this.fetch();
        },

        /**
         * Check if data has loaded
         */
        isLoaded: function() {
            return (!_.isUndefined(this.getData()));
        },

        /**
         * Get data
         */
        getData: function() {
            return this.get('total');
        },

    });

    return Connection;

});
