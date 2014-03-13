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
            var defaultSort = {"attribute":"total", "direction":"desc"},
                sort = !_.isUndefined(dimension.field.sort)? _.extend({}, defaultSort, dimension.field.sort): defaultSort,
                id = dimension.field.id,
                values,
                valuesSource;

            // We don't always need to get the element's totals. See the Element
            // model initialize()
            valuesSource = (this.model.fetchObservations[id]) ? this.model.getObservations(id) : this.model.getDimensions(id);
            values = _.chain(valuesSource)
                .map(function (value, index) {
                    if (this.model.fetchObservations[id]) {
                        return {
                            'id': value['id'],
                            'total': value['total'],
                            'totalFormat': format.num(value['total']),
                            'label': this.model.getLabel(value, id)['label']
                        };
                    } else {
                        return {
                            'id': value['id'],
                            'label': value['label']
                        };
                    }
                }, this)
                .sortBy(sort.attribute)
                .value();

            return {
                'id': id,
                // Sorting
                'values': (sort.direction === "desc") ? values.reverse() : values,
                'hierarchy': this.visualisation.dataset.getDimensionHierarchy(id),
                'dataset_cut': this.visualisation.dataset.getCut(),
                'required': _.isBoolean(dimension.field.required) ? dimension.field.required : false
            };
        },

        getDimensions: function () {
            return _(this.model.get('dimensions')).map(function (dimension, iterator) {

                var dimensionAttrs = this.getDimensionAttrs(dimension);

                var id = dimensionAttrs.id,
                    values = dimensionAttrs.values,
                    hierarchy = dimensionAttrs.hierarchy,
                    dataset_cut = dimensionAttrs.dataset_cut,
                    required = dimensionAttrs.required,
                    field = this.visualisation.dataset.fields.findWhere({'id':id});

                /**
                 * If the dimension is hierarchical, we need to keep track
                 * of the dimension values displayed on each level
                 */
                if (!_.isUndefined(hierarchy) && !_.isUndefined(dataset_cut[hierarchy.level_field])) {
                    var currentLevel = dataset_cut[hierarchy.level_field];
                    this.dimensionValuesByLevel[currentLevel - 1] = values;
                }

                return {
                    'id': id,
                    'dimension_filter_id': this.model.get('id') + '_' + id.replace(/[^a-z0-9_\-]/gi, '_'),
                    'label': _.isUndefined(field) ? this.model.get('label') : field.get('label'),
                    // cut set on this dimension
                    'cut': this.model.getCut(iterator),
                    // the cut set on all the dimensions
                    'dataset_cut': dataset_cut,
                    'hierarchy': _.extend({}, hierarchy, {'values_by_level': this.dimensionValuesByLevel}),
                    'values': values,
                    'required': required
                };

            }, this);
        },

        toggleCut: function (e) {
            e.preventDefault();
            var $cut = $(e.currentTarget),
                dimension = $cut.parents('.filter-group').data('dimension');
            if ($cut.closest('.cut-wrapper').hasClass('active')) {
                this.visualisation.dataset.removeCut([dimension]);
            } else {
                this.visualisation.dataset.addCut(_.object([dimension], [String($cut.data('value'))]));
            }
        }

    });

    return FilterElementView;

});
