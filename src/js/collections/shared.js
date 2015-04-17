define(['backbone', 'underscore', '../models/dataset/user'],
        function(Backbone, _, SharedUser) {
    'use strict';

    var SharedCollection = Backbone.Collection.extend({

        model: SharedUser,

        /**
         * Initialise shared users collection
         */
        initialize: function(models, opts) {
            this.dataset = opts.dataset;
        },

        /**
         * Shared users API endpoint URL
         */
        url: function() {
            return '/api/datasets/' + this.dataset.get('id') + '/shared/';
        },

        /**
         * Save shared users collection as a single PUT
         */
        save: function(opts) {
            opts = opts || {};
            return Backbone.sync('update', this, opts);
        },

        /**
         * Get a serialized representation of shared users state
         */
        getState: function() {
            return this.invoke('toJSON');
        },

        /**
         * Update shared users state
         */
        setState: function(state) {
            this.reset(state);
        }

    });

    return SharedCollection;

});
