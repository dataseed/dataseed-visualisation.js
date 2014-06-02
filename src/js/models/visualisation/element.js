define(['backbone', 'underscore'],
function (Backbone, _) {
    'use strict';

    var Element = Backbone.Model.extend({
        /**
         * Generic Element model.
         *
         * models.Visualisation.reset() sets element models in its
         * ElementsCollection from visualisation "elements" attribute. The
         * polymorphic collections.ElementsCollections is responsible of
         * instantiating the proper child Element model from the visualisation
         * "elements" type attribute
         */

        validParent: /\d+/,

        // True if a connections have been initialised
        _initConnections: false,

        // True if a connections sync is currently in progress.
        _syncingConnections: false,

        // True if connections have been synched at least once.
        _connectionsLoaded: false,

        url: function () {
            return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.visualisation.get('id') + '/elements/' + this.get('id');
        },

        initialize: function (options) {
            this.setUp(options);

            // Track connection syncs
            this._connectionsSynced = {
                observations: 0,
                dimensions: 0
            };

            if (this.get('display') === true) {
                // Only init connections if element is not hidden
                this.initConnections(options);
            }
        },

        /**
         * Set up basic element properties
         *
         */
        setUp: function (options) {
            // Set dataset and visualisation models
            this.dataset = options.dataset;
            this.visualisation = options.visualisation;

            // Get dimensions and observations connections models
            this.dimensions = [];
            this.observations = [];
        },

        /**
         * Init element's connections.
         */
        initConnections: function(){
            if (this._initConnections === true) {
                return;
            }

            _.each(this.get('dimensions'), function (opts) {
                if (_.isUndefined(opts.field.id)) {
                    return;
                }

                var values = {
                        dimension: opts.field.id,
                        bucket: opts.bucket,
                        measure: _.isNull(this.get('measure')) ? null : this.get('measure').id,
                        aggregation: this.get('aggregation')
                    },
                    observations = this.dataset.pool.getConnection(_.extend({type: 'observations'}, values)),
                    dimension = this.dataset.pool.getConnection(_.extend({type: 'dimensions'}, values));

                // Bind to sync event and keep references
                observations.bind('connection:sync', this.onConnectionSync, this);
                this.observations.push(observations);

                dimension.bind('connection:sync', this.onConnectionSync, this);
                this.dimensions.push(dimension);

                // Update connection sync counts
                if (observations.isLoaded()) {
                    this._connectionsSynced.observations++;
                }

                if (dimension.isLoaded()) {
                    this._connectionsSynced.dimensions++;
                }
            }, this);

            this._initConnections = true;
            this.checkConnectionSync();
        },

        /**
         * Dataset connection sync event handler
         */
        onConnectionSync: function (conn) {
            if(!this._syncingConnections){
                this._syncingConnections = true;
            }
            this._connectionsSynced[conn.get('type')]++;
            this.checkConnectionSync();
        },

        /**
         * Return true if all required data has loaded
         */
        connectionsAllSynched: function () {
            // Check that all observations and dimensions have completed sync.
            return ( (this._connectionsLoaded && !this._syncingConnections) ||
                (this._connectionsSynced.observations === this.observations.length &&
                    this._connectionsSynced.dimensions === this.dimensions.length));
        },

        checkConnectionSync: function() {
            if(this.connectionsAllSynched()){
                // This element is ready to be (re)rendered
                this.trigger('element:ready', this);

                // Reset internal flags/counters
                for (var type in this._connectionsSynced) {
                    this._connectionsSynced[type] = 0;
                }

                this._syncingConnections = false;
                this._connectionsLoaded = true;
            }
        },

        /**
         * Handle element feature (bar/point/etc) click
         */
        featureClick: function (index) {
            if (this.get('interactive') === false) {
                return false;
            }

            var dimension = this.getFieldId(),
                hierarchy = this.dataset.getDimensionHierarchy(dimension),
                observation = this.getObservation(index);

            // Non-hierarchical dimension
            if (_.isUndefined(hierarchy)) {
                if (this.hasCutId(observation.id)) {
                    this.removeCut();
                } else {
                    this.addCut(observation.id);
                }
            } else {
                // Hierarchical dimension, handle the drill up/down
                var level = observation[hierarchy.level_field];
                if (this.validParent.test(observation.id)) {
                    this.dataset.drillDown(dimension, level, this.validParent.exec(observation.id)[0]);
                }
            }

            return true;
        },

        /**
         * Send an "addCut" event for th
         */
        addCut: function (value) {
            this.trigger('addCut', _.object([this.getFieldId()], [value]));
        },

        /**
         * Send an "addCut" event
         */
        removeCut: function () {
            this.trigger('removeCut', [this.getFieldId()]);
        },

        /**
         * Get label for this element's measure
         */
        getMeasureLabel: function () {
            return this.get('measure_label');
        },

        /**
         * Get field type for this element's dimension
         */
        getFieldType: function() {
            return this.dataset.fields.get(this.getFieldId()).get('type');
        },

        /**
         * Get allowed chart types for this element's dimension
         */
        getChartTypes: function() {
            var field = this.dataset.fields.get(this.getFieldId());
            return _.pluck(field.get('charts'), 'type');
        },

        /**
         * Returns an element connection
         * @param type connection type. Possibile values: "dimensions" or "observations"
         * @param dimensionId the dimension id of the connection we want to get
         * if undefined, the first element of the dimensions/observations
         * connection is returned
         * @returns an Element connection
         */
        getElementConnection: function (type, dimensionId) {
            if (!_.isUndefined(this[type])) {
                if (_.isUndefined(dimensionId)) {
                    return this[type][0];
                }
                return _.find(this[type], function (conn) {
                    return conn.get('dimension') === dimensionId;
                });
            }
        },

        /**
         * Proxy methods
         */
        getElementConnectionData: function (type, dimensionId) {
            var conn = this.getElementConnection(type, dimensionId);

            if (!_.isUndefined(conn)) {
                return conn.getData();
            }
        },

        getLabels: function (dimensionId) {
            return this.getElementConnectionData('dimensions', dimensionId);
        },

        getLabel: function (value, dimensionId) {
            var label = _.extend({label: ''}, value),
                conn = this.getElementConnection('dimensions', dimensionId);

            if (!_.isUndefined(conn) && !_.isUndefined(conn.getValue(value.id))) {
                label = conn.getValue(value.id);
            }

            return label;
        },

        getObservations: function (dimensionId) {
            return this.getElementConnectionData('observations', dimensionId);
        },

        getObservation: function (i, dimensionId) {
            var conn = this.getElementConnection('observations', dimensionId);

            if (!_.isUndefined(conn)) {
                return conn.getValue(i);
            }
        },

        getDimension: function (i, dimensionId) {
            var conn = this.getElementConnection('dimensions', dimensionId);

            if (!_.isUndefined(conn)) {
                return conn.getValue(i);
            }
        },

        getTotal: function (dimensionId) {
            var conn = this.getElementConnection('observations', dimensionId);

            if (!_.isUndefined(conn)) {
                return conn.getTotal();
            }
        },

        getFieldId: function (index) {
            if (_.isUndefined(index)) {
                index = 0;
            }
            return this.get('dimensions')[index].field.id;
        },

        getCut: function (index) {
            return this.dataset.getCut(this.getFieldId(index));
        },

        isCut: function (index) {
            return this.dataset.isCut(this.getFieldId(index));
        },

        hasCutId: function (id, index) {
            return this.dataset.hasCutId(this.getFieldId(index), id);
        },

        hasCutValue: function (i, index) {
            return this.dataset.hasCutValue(this.getFieldId(index), i);
        }

    });

    return Element;

});
