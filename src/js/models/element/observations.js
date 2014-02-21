define(['backbone', 'underscore'], function(Backbone, _) {
    'use strict';

    var ObservationsModel = Backbone.Model.extend({

        cut: {},

        url: function() {
            var url = '/api/datasets/' + this.dataset.get('id') + '/observations/' + this.get('id'),
                params = _.extend({}, this.cut, {'aggregation': this.element.get('aggregation')});

            // Add measure to query parameters
            var measure = this.element.get('measure');
            if (!_.isUndefined(measure) && _.isObject(measure) && !_.isUndefined(measure['id'])) {
                params['measure'] = measure['id'];
            }

            // Add bucketing to query parameters
            var bucket = this.get('bucket');
            if (!_.isNull(bucket) && _.isFinite(bucket)) {
                params['bucket'] = bucket;
            }

            // Add query parameters to URL
            var urlParams = _.map(params, function (value, key, cut) { return key + '=' + value; });
            url += '?' + urlParams.join('&');

            return url;
        },

        initialize: function(options) {
            // Set element and dataset models
            this.element = options['element'];
            this.dataset = options['dataset'];
        },

        isLoaded: function() {
            return (!_(this.getObservations()).isUndefined());
        },

        /**
         * Get all observations
         */
        getObservations: function() {
            return this.get(this.get('id'));
        },

        /**
         * Get the specified value for this dimension
         */
        getObservation: function(i) {
            return this.getObservations()[i];
        },

        /**
         * Sum the values for this dimension
         */
        getTotal: function() {
            var currentCut = null;
            if (this.isCut()) {
                currentCut = this.getCut();
            }
            return _.reduce(this.getObservations(), function(m, v) {
                if (currentCut === null || currentCut === v.id) {
                    return m + v.total;
                }
                return m;
            }, 0);
        },

        /**
         * Get the value of the current cut for this dimension
         */
        getCut: function() {
            return this.cut[this.get('id')];
        },

        /**
         * Check if this dimension is included in the current cut
         */
        isCut: function() {
            return (this.get('id') in this.cut);
        },

        /**
         * Compares the specified ID to the ID of the current cut for this dimension
         */
        hasCutId: function(id) {
            return (this.isCut() && this.getCut() === id);
        },

        /**
         * Compares the value at the specified index to the value of the current cut for this dimension
         */
        hasCutValue: function(i) {
            if (this.isCut()) {
                var observation = this.getObservation(i);
                return (!_.isUndefined(observation) && this.getCut() === observation.id);
            }
            return false;
        },

        /**
         * Set cut
         */
        setCut: function(key, value) {
            this.cut[key] = value;
            this.fetch();
        },

        /**
         * Unset cut
         */
        unsetCut: function(key) {
            if (_.isUndefined(key)) {
                this.cut = {};
            } else {
                delete this.cut[key];
            }
            this.fetch();
        }

    });

    return ObservationsModel;

});
