define(['backbone', 'underscore', '../../lib/format'],
        function(Backbone, _, format) {
    'use strict';

    var Dimension = Backbone.Model.extend({

        cut: {},

        /**
         * Dimension values URL
         */
        url: function() {
            var url = '/api/datasets/' + this.dataset.get('id') + '/dimensions/' + this.get('id');

            // Add query parameters to URL
            var urlParams = _.map(_.clone(this.cut), function (value, key, cut) {
                return key + '=' + value;
            });
            url += '?' + urlParams.join('&');

            return url;
        },

        /**
         * Init
         */
        initialize: function(options) {
            // Set dataset model
            this.dataset = options['dataset'];

            // Setup label formatters for custom types
            if (this.get('type') in this.formatters) {
                this.formatter = this.formatters[this.get('type')];
            }
        },

        isLoaded: function() {
            return (!_.isUndefined(this.get(this.get('id'))));
        },

        /**
         * Dimension label formatting
         */
        formatter: null,

        formatters: {
            'date': function(timestamp) {
                return format.date(new Date(parseInt(timestamp, 10)));
            }
        },

        /*
         * Get all dimension labels
         */
        getLabels: function() {
            var labels = this.get(this.get('id'));
            if (!_.isUndefined(labels)) {
                return labels;
            }
            return {};
        },

        /*
         * Get a dimension value's label
         */
        getLabel: function(value) {
            // Get label, or use ID
            var label = this.getLabels()[value.id];
            if (_.isUndefined(label)) {
                label = {'label': value.id};
            }

            // Perform type specific label transforms
            if (this.formatter) {
                label['label'] = this.formatter(label['label']);
            }
            return label;
        },

        /**
         * Set cut
         * @param cut list of cut object descriptors in the form
         *      {"key":"foo", "value":"bar"}
         * @param successCallback optional callback to invoke upon completion of
         *      the fetch request
         */
        setCut: function (cut, successCallback) {
            _.each(cut, _.bind(function (c) {
                    if(_.isNull(c.value)){
                        delete this.cut[c.key];
                    }else{
                        this.cut[c.key] = c.value;
                    }
                },this));
            // TODO Ensure we really need to fetch the dimensions each time the cut changes
            if(_.isUndefined(successCallback)){
                this.fetch();
            }else{
                this.fetch().complete(successCallback);
            }

        },

        /**
         * Unset cut
         * @param cut list of dimension ids
         * @param successCallback optional callback to invoke upon completion of
         *      the fetch request
         */
        unsetCut: function (keys, successCallback) {
            if (_.isUndefined(keys)) {
                this.cut = {};
            } else {
                _.each(keys, _.bind(function (k) {
                    delete this.cut[k];
                }, this));
            }
            // TODO Ensure we really need to fetch the dimensions each time the cut changes
            if (_.isUndefined(successCallback)) {
                this.fetch();
            } else {
                this.fetch().complete(successCallback);
            }
        }
    });

    return Dimension;

});
