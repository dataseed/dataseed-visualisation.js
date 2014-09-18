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
    var DimensionsElement = Element.extend({

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
            _.each(this.get('dimensions'), function (dimension, index) {

                // Get common connection options
                var opts = {
                    dimension: dimension.field.id,
                    bucket: dimension.bucket,
                    bucket_interval: dimension.bucket_interval,
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

            // Bind to sync event and keep a reference
            conn.bind('connection:sync', this._onSync, this);

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

        /**
         * Check if all connections have loaded
         */
        isLoaded: function() {
            if (!this._connections) {
                return false;
            }
            var obs = this._connections.observations,
                dims = this._connections.dimensions;
            return (
                // All observations have loaded, and...
                obs.num > 0 && obs.loaded > 0 && (obs.loaded % obs.num) === 0 &&
                (
                    // There are no dimensions, or...
                    (dims.num === 0) ||
                    (
                        // All dimensions have loaded and...
                        (dims.loaded > 0 && (dims.loaded % dims.num) === 0) &&

                        // Dimensions and observations have loaded an equal number of times
                        (dims.loaded / obs.loaded === dims.num / obs.num)
                    )
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
         * Get dimension field
         */
        _getField: function(index) {
            if (!index) {
                index = 0;
            }
            return this._fields[index];
        },

        /**
         * Get all observations ids
         */
        getObservationsIds: function (id) {
            return this._getConnection('observations', id).getDataIds();
        },

        /**
         * Helper to build the arguments to pass through addCut() / removeCut()
         * Those arguments depend on the type of the field we want to cut on.
         */
        buildCutArgs: function (cutValue, index) {
            // If we are cutting on a dimension referring to a numeric/date
            // field we have to query on intervals. Given that these type of
            // fields are such that observation ids are equals to their related
            // value, the interval will be defined like so:
            //  - the "from endpoint" will be cutValue
            //  - the "to endpoint" will be the minimum observation value
            //    greater than "cutValue"
            if (_.contains(this.bucketFields, this.getFieldType(index))) {
                var obs_IDs = this.getObservationsIds(),
                    from = cutValue,
                    toIdx = _.indexOf(obs_IDs, cutValue) + 1;

                return _.isUndefined(obs_IDs[toIdx]) ?
                    // d.id is the greatest observation value (APIs
                    // return observations ordered by their ids).
                    // Build an interval with no "to endpoint"
                    [from] :
                    [from, obs_IDs[toIdx]];
            } else {
                return [cutValue];
            }
        },

        /**
         * Override of Element.hasCutId().
         * For dimensions whose values could be bucketed, the cut is set on
         * ranges of values. For these dimensions, this helpers returns true
         * only if:
         *  - id is included in the dataset cut on the dimension
         *  - id refers to a "from endpoint" of a range the dimension is cut on
         *
         * @see Element.bucketFields
         * @see DimensionElement.buildCutArgs()
         */
        hasCutId: function (id, index) {
            var ret = Element.prototype.hasCutId.apply(this, arguments);

            if (_.contains(this.bucketFields, this.getFieldType(index))) {
                var dimensionId = this._getField(index).get('id');
                ret = ret && (_.indexOf(this.dataset.cut[dimensionId], id) % 2 === 0);
            }
            return ret;
        }

    });

    return DimensionsElement;

});
