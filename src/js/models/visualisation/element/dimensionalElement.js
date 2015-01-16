define(['backbone', 'underscore', '../element'],
function (Backbone, _, Element) {
    'use strict';

    /**
     * Element with dimensional connections.
     * For each dimension d, the element is related to:
     *   - a connection of type 'observations' to get the observations related to d
     *   - a connection of type 'dimensions' to get the dimensions values for d, if d is non
     *     date/numeric
     */
    var DimensionalElement = Element.extend({

        // Maps field types to the related allowed values and labels for the
        // bucket_interval attribute.
        bucketIntervals: {
            date: {
                date_year: 'Year',
                date_quarter: 'Quarter',
                date_month: 'Month',
                date_week: 'Week',
                date_day: 'Day',
                date_hour: 'Hour',
                date_minute: 'Minute',
                date_second: 'Second'
            }
        },

        initConnections: function() {
            if (this._connections) {
                return;
            }

            // Observations and dimensions connections
            this._connections = {
                observations: {
                    pool: {},
                    num: 0,
                    loaded: 0
                },
                dimensions: {
                    pool: {},
                    num: 0,
                    loaded: 0
                }
            };

            // Initiate connections
            this.dimensions.each( function (dimension, index) {

                // Get common connection options
                var opts = {
                    dimension: dimension.get('field').id,
                    bucket: dimension.get('bucket'),
                    bucket_interval: dimension.get('bucket_interval'),
                    measure: _.isNull(this.get('measure')) ? null : this.get('measure').id,
                    aggregation: this.get('aggregation')
                };

                // Observations
                this._initConnection('observations', opts);

                // Dimension values (only fetch if the field type has an
                // associated dimension connection model - see the parent
                // Element model object.)
                if (_.contains(this.dimensionFields, this._getField(index).get('type'))) {
                    this._initConnection('dimensions', opts);
                }

            }, this);

        },

        /**
         * Initialise an observations or dimension connection
         */
        _initConnection: function(type, opts) {
            // Get connection
            var conn = this.dataset.pool.getConnection(_.extend({type: type}, opts));

            // Bind to sync event
            this.listenTo(conn,'connection:sync', this._onSync);

            // Keep reference
            this._connections[type].pool[opts.dimension] = conn;

            // Update count
            this._connections[type].num++;

            // Update connection sync counts
            if (conn.isLoaded()) {
                this._connections[type].loaded++;
            }
        },

        /**
         * Handle connection sync event
         */
        _onSync: function(conn) {
            this._connections[conn.get('type')].loaded++;
            this.ready();
        },

        /*
         * Helper to get an array of all the element's connections instances (both
         * observations and dimensions)
         */
        getConnections: function () {
            if (_.isUndefined(this._connections)) {
                return [];
            }

            return _.reduce(
                [this._connections.observations.pool, this._connections.dimensions.pool],
                function (connections, pool) {
                    return connections.concat(_.map(pool, function (conn) {
                        return conn;
                    }));
                },
                []
            );
        },

        removeConnections: function () {
            if (this._connections) {
                _.each(this.getConnections(), function (conn) {
                    this.dataset.pool.releaseConnection(conn);
                }, this);
                delete this._connections;
            }
        },

        /**
         * Check if all connections have loaded
         */
        isLoaded: function() {
            if (!this._connections) {
                return false;
            }
            var obs = this._connections.observations,
                dims = this._connections.dimensions,
                // True if all observations have loaded
                observationsAllLoaded = (obs.num > 0 && obs.loaded > 0 && (obs.loaded % obs.num) === 0),
                // True if all dimensions have loaded
                dimensionsAllLoaded = (dims.loaded > 0 && (dims.loaded % dims.num) === 0);
            return (
                // All observations have loaded, and...
                observationsAllLoaded &&
                (
                    // There are no dimensions, or...
                    (dims.num === 0) ||
                    // All dimensions have loaded and
                    // Dimensions and observations have loaded an equal number of times
                    (dimensionsAllLoaded && (dims.loaded / obs.loaded === dims.num / obs.num))
                )
            );
        },

        /**
         * Get observations or dimension connection
         */
        _getConnection: function(type, id) {
            if (!id) {
                id = _.keys(this._connections[type].pool)[0];
            }
            return this._connections[type].pool[id];
        },

        /**
         * Get all observations ids
         */
        _getObservationsIds: function (id) {
            return this._getConnection('observations', id).getDataIds();
        },

        /**
         * Helper to build the arguments to pass through addCut() / removeCut()
         */
        buildCutArgs: function (cutValue, index) {
            // When cutting on bucketed fields, use an interval based on the
            // observation IDs (i.e. the values themselves):
            // * from - the passed cutValue
            // * to - the next largest observation value
            if (this.isBucketed(index)) {

                // Check that d.id isn't the last observation value
                var IDs = this._getObservationsIds(),
                    toIdx = _.indexOf(IDs, cutValue) + 1;
                if (!_.isUndefined(IDs[toIdx])) {
                    return [cutValue, IDs[toIdx]];
                }
            }

            // The cut is either on a non-bucketed field, or on the last
            // observation value of a bucketed field (so there is no "to" value)
            return [cutValue];
        },

        /**
         * Override of Element.hasCutId().
         * For dimensions whose values could be bucketed, the cut is set on
         * ranges of values. For these dimensions, this helper returns true
         * only if:
         *  - id is included in the dataset cut on the dimension
         *  - id refers to a "from endpoint" of a range the dimension is cut on
         *
         * @see Element.bucketFields
         * @see this.buildCutArgs()
         */
        hasCutId: function (id, index) {
            var ret = Element.prototype.hasCutId.apply(this, arguments);

            if (this.isBucketed(index)) {
                var dimensionId = this._getField(index).get('id');
                ret = ret && (_.indexOf(this.dataset.cut[dimensionId], id) % 2 === 0);
            }
            return ret;
        }

    });

    return DimensionalElement;

});
