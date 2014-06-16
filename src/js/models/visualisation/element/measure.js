define(['backbone', 'underscore', '../element'],
function (Backbone, _, Element) {
    'use strict';

    /**
     * Element related to only one observations connection to get aggregation
     * data.
     * Beware: the element still have a dimensions attribute but it is not taken
     * into account to set its connections.
     */
    var MeasureElement = Element.extend({

        /**
         * Initialise connection for aggregation data
         */
        initConnections: function() {
            if (this._connection) {
                return;
            }

            // Get connection model
            this._connection = this.dataset.pool.getConnection({
                type: 'observations',
                measure: _.isNull(this.get('measure')) ? null : this.get('measure').id,
                aggregation: this.get('aggregation')
            });

            // Bind to sync event
            this._connection.bind('sync', this._onSync, this);
        },

        /**
         * Handle connection sync event
         */
        _onSync: function() {
            this.ready();
        },

        /**
         * Check if connection data is loaded
         */
        isLoaded: function() {
            return this._connection.isLoaded();
        },

        /**
         * Get observations connection
         */
        _getConnection: function() {
            return this._connection;
        },

        /**
         * Get observations field
         */
        _getField: function() {
            return this._fields[0];
        }

    });

    return MeasureElement;

});
