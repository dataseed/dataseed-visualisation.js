define(['backbone', 'underscore', './visualisation', '../collections/fields', '../collections/pool'],
    function(Backbone, _, Visualisation, FieldsCollection, ConnectionPool) {
    'use strict';

    var Dataset = Backbone.Model.extend({

        url: function() {
            return '/api/datasets/' + this.get('id');
        },

        /**
         * Initialise dataset's visualisation model
         */
        initialize: function(options) {
            // Check if visualisation was supplied in model data
            if (!_.isUndefined(options.visualisations) && !_.isUndefined(options.visualisations[0])) {
                this.visualisation = new Visualisation(_.extend(
                    {dataset: this},
                    options.visualisations[0]
                ));

            // Check if visualisation ID was supplied
            } else if (!_.isUndefined(options.visualisation_id)) {
                this.visualisation = new Visualisation({
                    id: options.visualisation_id,
                    dataset: this
                });

            } else {
                console.error('No visualisation model supplied');
                return;
            }

            // Initialise cut
            this.cut = options.cut || {};

            // Create collection for field models
            this.fields = new FieldsCollection();

            // Create connection pool collection
            this.pool = new ConnectionPool(null, {dataset: this, defaultCut: options.cut});
        },

        reset: function () {
            // Set model defaults
            var defaults = {
                dataset: this.dataset,
                defaultCut: this.get('cut')
            };

            // Set element models in collection from visualisation "elements" attribute
            this.fields.set(_.map(this.get('fields'), function (field) {
                return _.extend({}, defaults, field);
            }, this));
        },

        /**
         * Get dataset measure fields
         */
        getMeasureFields: function() {
            return this.fields.filter(function(field) {
                return (_.size(field.get('aggregations')) > 0);
            });
        },

        /**
         * Get the list of values of the current cut for this dimension.
         * Returns undefined if no cut is set on dimension.
         */
        getCut: function(dimension) {
            if (_.isUndefined(dimension)) {
                return _.clone(this.cut);
            } else if (dimension in this.cut) {
                return _.clone(this.cut[dimension]);
            }
            return [];
        },

        /**
         * Check if this dimension is included in the current cut
         */
        isCut: function(dimension) {
            return _.has(this.cut, dimension);
        },

        /**
         * Compares the specified ID to the ID of the current cut for this dimension
         */
        hasCutId: function(dimension, id) {
            return (this.isCut(dimension) && _.indexOf(this.cut[dimension], id) > -1);
        },

        /**
         * Set cut(s)
         *
         * @param cut
         *      the cut to be set
         * @param append
         *      true if we want the cut values to be appended rather than replaced
         */
        addCut: function (cut, append) {
            // Update dataset cut
            _.each(cut, function (value, key) {
                if (_.isNull(value)) {
                    delete this.cut[key];
                } else if (append === true) {
                    if (_.isUndefined(this.cut[key])) {
                        this.cut[key] = [];
                    }
                    this.cut[key].push(value);
                } else if (_.isArray(value)) {
                    this.cut[key] = value;
                } else {
                    this.cut[key] = [value];
                }
            }, this);

            // Update field connections
            this.pool.forEach(function(conn) {

                // Update cut on every field connection
                conn.set('cut', this.cut);

                var fetchConn = true;

                if (!_.isUndefined(conn.get('dimension'))) {
                    var dimension = conn.get('dimension'),
                        type = conn.get('type'),
                        update = this.fields.get(dimension).get('update_dimension');

                    // Re-fetch if the field *isn't* included in the updated cut
                    fetchConn = (_.size(cut) > 1 || !_.has(cut, dimension)) && (type !== 'dimensions' || update === true);
                }

                // Re-fetch the connection or just let the observers know that
                // this connection is already synched, so that a re-render could
                // be initiated
                if(fetchConn){
                    conn.fetch();
                }else{
                    conn.trigger('connection:sync', conn);
                }

            }, this);

        },

        /**
         * Remove cut(s)
         * @param keys
         *      keys
         * @param values
         *      (optional) cut values to remove. Useful to handle multi-values
         *      cuts.
         *      if values[i] is undefined, the dataset cut will be set such that
         *      cut[keys[i]] = null; otherwise we'll get the new value for
         *      cut[keys[i]] by omitting values[i] from cut[keys[i]]
         */
        removeCut: function(keys, values) {
            if (_.isUndefined(keys)) {
                keys = _.keys(this.cut);
            }

            if(_.isUndefined(values)){
                values = [];
            }

            // Set a new cut for the dataset filtering out the provided
            // dimensions/values
            this.addCut(_.object(
                keys,
                _.map(keys, function (k, i) {
                    if (!_.isUndefined(this.cut[k]) && !_.isUndefined(values[i])) {
                        var cutValues = _.without(this.getCut(k), values[i]);
                        if (cutValues.length > 0) {
                           return cutValues;
                        }
                    }
                    return null;
                }, this)
            ));
        },

        /**
         * Get a dimension's hierarchy
         */
        getDimensionHierarchy: function (dimensionId) {
            // hierarchy defined by the visualisation for this dimension
            var hierarchy;

            if (!_.isUndefined(this.get('hierarchies'))) {
                hierarchy = _.chain(this.get('hierarchies'))
                    .find(function (h) {
                        return h.id === dimensionId;
                    })
                    .value();
            }

            if (!_.isUndefined(hierarchy) &&
                (_.isUndefined(hierarchy.available_levels) ||
                 _.isUndefined(hierarchy.available_levels.lower_bound) ||
                 _.isUndefined(hierarchy.available_levels.upper_bound))
               ){
                var default_available_levels = {
                    lower_bound: 1,
                    upper_bound: hierarchy.ancestor_fields.length
                };
                hierarchy = _.extend({}, default_available_levels, hierarchy.available_levels);
            }

            return hierarchy;
        },

        /**
         * Reset the cut defined on the ancestor dimensions that are related
         * to hierarchy levels equal or deeper than leve
         */
        resetAncestorsCut: function (dimensionId, ancestorFields, level) {
            var fields = ancestorFields.slice(0, level - 1);
            return _.object(fields, _.map(fields, function () { return null; }));
        },

        /**
         *  Drill Down
         *
         * @param dimensionId the hierarchical dimension
         * @param triggerLevel the level which "triggered" the drill
         * @param parent the value to set for the cut on the hierarchical
         *      dimension's parent dimension
         */
        drillDown: function (dimensionId, triggerLevel, parent) {
            var dimensionHierarchy = this.getDimensionHierarchy(dimensionId);

            // if the dimension is not hierarchical or we already are in the
            // deepest available level of the hierarchy, do nothing
            if (_.isUndefined(dimensionHierarchy) || triggerLevel <= dimensionHierarchy.available_levels.lower_bound) {
                return;
            }
            // List of the dimensions ids of the hierarchical
            // dimension's value's ancestors at each level of the
            // hierarchy. The list is 0-based, hierarchy levels are not:
            // ancestorFields[i] is the hierarchical dimension's value's
            // ancestor at level i+1
            var ancestorFields = dimensionHierarchy.ancestor_fields,
                levelField = dimensionHierarchy.level_field,

            // Reset the cut defined on the ancestor dimensions that are
            // related to hierarchy levels equal or deeper than hLevel
                newCut = this.resetAncestorsCut(dimensionId, ancestorFields, triggerLevel);


            // We need to set a cut on the ancestor dimension
            // for level triggerLevel - 1: we want to drill down to
            // triggerLevel - 1 and see all the observations for that level whose
            // hierarchical dimension's value's parent is the "parent"
            // parameter
            newCut[levelField] = String(triggerLevel - 1);
            newCut[ancestorFields[(triggerLevel - 1) - 1]] = parent;
            this.addCut(newCut);
        },

        /**
         * Drill Up
         *
         * @param dimensionId the hierarchical dimension
         * @param triggerLevel the level which "triggered" the drill
         */
        drillUp: function (dimensionId, triggerLevel) {
            var dimensionHierarchy = this.getDimensionHierarchy(dimensionId);

            // if the dimension is not hierarchical or we already are in the
            // highest available level of the hierarchy, do nothing
            if (_.isUndefined(dimensionHierarchy) || triggerLevel > dimensionHierarchy.available_levels.upper_bound) {
                return;
            }

            // see drillDown for the semantic of the following variables
            var ancestorFields = dimensionHierarchy.ancestor_fields,
                levelField = dimensionHierarchy.level_field,

            // Reset the cut defined on the ancestor dimensions that are
            // related to hierarchy levels equal or deeper than hLevel
                newCut = this.resetAncestorsCut(dimensionId, ancestorFields, triggerLevel);

            newCut[levelField] = String(triggerLevel);
            this.addCut(newCut);
        }

    });

    return Dataset;

});
