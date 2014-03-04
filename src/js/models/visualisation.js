define(['backbone', 'underscore', '../collections/elements', '../collections/styles'],
    function (Backbone, _, ElementsCollection, StylesCollection) {
        'use strict';

        var Visualisation = Backbone.Model.extend({

            MAX_ELEMENTS: 100,

            url: function () {
                return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.get('id');
            },

            initialize: function () {
                // Create collection for element models
                this.elements = new ElementsCollection();
                this.elements.bind('add', this.addElement, this);
                this.elements.bind('reset', this.updateElementOrder, this);

                // Create collection for style models
                this.styles = new StylesCollection(null, {'visualisation': this});
            },

            addElement: function (element) {
                element.bind('addCut', this.addCut, this);
                element.bind('removeCut', this.removeCut, this);
            },

            reset: function () {
                // Set model defaults
                var defaults = {
                    'dataset': this.dataset,
                    'visualisation': this,
                    'defaultCut': this.get('defaultCut')
                };

                // Set element models in collection from visualisation "elements" attribute
                this.elements.set(_.map(this.get('elements'), function (element) {
                    return _.extend({}, defaults, element);
                }, this));

                // Set style models in collection from visualisation "styles" attribute
                this.styles.set(_.map(this.get('styles'), function (element) {
                    return _.extend({}, defaults, element);
                }, this));
            },

            updateElementOrder: function () {
                // Start from current largest weight
                var offsetElement = this.elements.max(function (element) {
                        return element.get('weight');
                    }),
                    offset = offsetElement.get('weight');

                // Reset to 0 if we're going to exceed the size of the weight field
                if ((offset + this.elements.size()) >= this.MAX_ELEMENTS) {
                    offset = 0;
                }

                // Update element weights
                this.elements.forEach(function (element, index) {
                    element.set('weight', offset + index + 1, {'silent': true});
                });
            },

            addCut: function (cut) {
                this.elements.invoke('setCut', cut);
            },

            removeCut: function (keys) {
                this.elements.invoke('unsetCut', keys);
            },

            getDimensionHierarchy: function (dimensionId) {
                // hierarchy defined by the visualisation for this dimension
                var hierarchy;

                if (!_.isUndefined(this.get('hierarchies'))) {
                    hierarchy = _.chain(this.get('hierarchies'))
                        .find(function (h) {
                            return h.id == dimensionId;
                        })
                        .value();

                    // set default available levels if not provided by the model
                    if (_.isUndefined(hierarchy.available_levels) || _.isUndefined(hierarchy.available_levels.lower_bound) || _.isUndefined(hierarchy.available_levels.upper_bound)) {
                        hierarchy.available_levels = _.extend({}, hierarchy.available_levels, {
                            "lower_bound": 1,
                            "upper_bound": hierarchy.ancestor_fields.length
                        });
                    }
                }

                return hierarchy;
            },

            /**
             * Reset the cut defined on the ancestor dimensions that are related
             * to hierarchy levels equal to or deeper than level
             */
            resetAncestorsCut: function (dimensionId, ancestorFields, level) {
                return _.chain(ancestorFields.slice(0, level - 1))
                    .map(function (af, index) {
                        return {
                            'key': af,
                            'value': null
                        };
                    })
                    .value();
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
                newCut.push({"key": levelField, "value": String(triggerLevel - 1)});
                newCut.push({"key": ancestorFields[(triggerLevel - 1) - 1], "value": parent});
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


                newCut.push({"key": levelField, "value": String(triggerLevel)});
                this.addCut(newCut);
            }

        });

        return Visualisation;

    });
