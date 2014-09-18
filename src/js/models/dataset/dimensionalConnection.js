define(['backbone', 'underscore', './connection'],
    function (Backbone, _, Connection) {
    'use strict';

    var DimensionalConnection = Connection.extend({

        // Keep track of the observation/dimension ids fetched by this connection
        dataIds : {},

        apiEndpoint: function () {
            return '/api/datasets/' + this.dataset.get('id') + '/' + this.get('type') + '/' + this.get('dimension');
        },

        /**
         * Init
         */
        initialize: function (options) {
            Connection.prototype.initialize.apply(this, arguments);

            // On connection sync keep track of the ids related to the fetched
            // data.
            this.listenTo(this, 'connection:sync', function (conn) {
                conn.dataIds[this.get('dimension')] = _.pluck(this.getData(), 'id');
            });
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
        getValue: function(i) {
            return this.getData()[i];
        },

        /**
         * Get the specified value by ID
         */
        getValueById: function(id) {
            return _.findWhere(this.getData(), {id: id});
        },

        /**
         * Get data ids
         */
        getDataIds: function () {
            return this.dataIds[this.get('dimension')];
        }
    });

    return DimensionalConnection;

});
