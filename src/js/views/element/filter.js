define(['backbone', 'underscore', '../../lib/format'],
    function (Backbone, _, format) {
        'use strict';

        var FilterElementView = Backbone.View.extend({

            initialize: function (options) {
                // Bind to element models
                this.visualisation = options['visualisation'];
                this.visualisation.elements.bind('ready', this.render, this);
            },

            dimensionValuesByLevel: [],

            /**
             * Getter method used basically to get the element's attributes
             * which are passed to the filter template by the child instances
             * @returns {{id: (*|Array), label: (*|Array), dimensions: *}}
             */
            getElementAttrs: function () {
                return  {
                    'id': this.model.get('id'),
                    'label': this.model.get('label'),
                    'dimensions': this.getDimensions()
                };
            },

            getDimensionAttrs: function (dimension) {
                var thisView = this,
                    defaultSort = {"attribute":"total", "direction":"desc"},
                    sort = !_.isUndefined(dimension.field.sort)? _.extend({}, defaultSort, dimension.field.sort): defaultSort,
                    id = dimension.field.id,
                    model = this.visualisation.elements.find(function (element) {
                        return (element.getFieldId() === id && element.get('id') !== thisView.model.id);
                    }),
                    values = _.chain(model.getObservations())
                        .map(function (value, index) {
                            return {
                                'id': value['id'],
                                'total': value['total'],
                                'totalFormat': format.num(value['total']),
                                'label': model.getLabel(value)['label']
                            };
                        }, this)
                        .sortBy(sort.attribute)
                        .value();

                return {
                    'id': id,
                    'model': model,
                    // Sort descending
                    'values': (sort.direction === "desc") ? values.reverse() : values,
                    'hierarchy': dimension.field.hierarchy,
                    'observations_cut': this.model.observations.cut
                };
            },

            getDimensions: function () {
                return _(this.model.get('dimensions')).map(function (dimension) {

                    var dimensionAttrs = this.getDimensionAttrs(dimension);

                    var id = dimensionAttrs.id,
                        model = dimensionAttrs.model,
                        values = dimensionAttrs.values,
                        hierarchy = dimensionAttrs.hierarchy,
                        observations_cut = dimensionAttrs.observations_cut;

                    /**
                     * If the dimension is hierarchical, we need to keep track
                     * of the dimension values displayed on each level
                     */
                    if (!_.isUndefined(hierarchy) && !_.isUndefined(observations_cut[hierarchy.level_attr_id])) {
                        var currentLevel = observations_cut[hierarchy.level_attr_id];
                        this.dimensionValuesByLevel[currentLevel - 1] = values;
                    }

                    return {
                        'id': id,
                        'dimension_filter_id': this.model.get('id') + '_' + id.replace(/[^a-z0-9_\-]/gi, '_'),
                        'label': model.get('label'),
                        // cut set on this dimension
                        'cut': model.getCut(),
                        // the cut set on all the dimensions
                        'observations_cut': observations_cut,
                        'hierarchy': _.extend({}, hierarchy, {'values_by_level': this.dimensionValuesByLevel}),
                        'values': values
                    };

                }, this);
            },

            toggleCut: function (e) {
                e.preventDefault();
                var $cut = $(e.currentTarget),
                    dimension = $cut.parents('.filter-group').data('dimension');
                if ($cut.closest('.cut-wrapper').hasClass('active')) {
                    this.visualisation.removeCut([dimension]);
                } else {
                    this.visualisation.addCut([
                        {"key": dimension, "value": String($cut.data('value'))}
                    ]);
                }
            }

        });

        return FilterElementView;

    });
