define(['backbone', 'underscore', '../../lib/format'],
    function (Backbone, _, format) {
        'use strict';

        var FilterElementView = Backbone.View.extend({

            initialize: function (options) {
                // Bind to element models
                this.visualisation = options['visualisation'];
                this.visualisation.elements.bind('ready', this.render, this);
            },

            getElementAttrs: function () {
                return  {
                    'id': this.model.get('id'),
                    'label': this.model.get('label'),
                    'dimensions': this.getDimensions()
                };
            },

            getDimensionAttrs: function (dimension) {
                var thisView = this;
                var id = dimension.field.id,
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
                        .sortBy('total')
                        .value();

                return {
                    'id': id,
                    'model': model,
                    // Sort descending
                    'values': values.reverse()
                };
            },

            getDimensions: function () {
                return _(this.model.get('dimensions')).map(function (dimension) {

                    var dimensionAttrs = this.getDimensionAttrs(dimension);

                    var id = dimensionAttrs.id,
                        model = dimensionAttrs.model,
                        values = dimensionAttrs.values;

                    return {
                        'id': id,
                        'dimension_filter_id': this.model.get('id') + '_' + id.replace(/[^a-z0-9_\-]/gi, '_'),
                        'label': model.get('label'),
                        'cut': model.getCut(),
                        'values': values
                    };

                }, this);
            },

            toggleCut: function (e) {
                e.preventDefault();
                var $cut = $(e.currentTarget),
                    dimension = $cut.parents('.filter-group').data('dimension');
                if ($cut.closest('.cut-wrapper').hasClass('active')) {
                    this.visualisation.removeCut(dimension);
                } else {
                    this.visualisation.addCut(dimension, String($cut.data('value')));
                }
            }

        });

        return FilterElementView;

    });
