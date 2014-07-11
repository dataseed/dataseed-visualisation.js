define(['backbone', 'underscore', '../../../lib/format', 'text!../../../templates/element/filter/navigationDimension.html', 'text!../../../templates/element/filter/navigationElement.html', 'bootstrap_collapse'],
    function (Backbone, _, format, navigationDimensionTemplate, navigationElementTemplate) {
    'use strict';

    var NavigationDimensionView = Backbone.View.extend({

        template: _.template(navigationDimensionTemplate),

        initialize: function(opts) {
            this.navigation = opts.navigation;
            this.dimension = opts.dimension;
            this.index = opts.index;
        },

        render: function() {
            var attrs = this.navigation.getDimension(this.dimension, this.index);
            this.$el.html(this.template(attrs));
            return this;
        }

    });

    var NavigationElementView = Backbone.View.extend({

        events: {
            'click td .dimension-cut input': 'toggleCut',
            'click h3 a': 'toggleAccordion'
        },

        template: _.template(navigationElementTemplate),

        initialize: function(options) {
            this.visualisation = options.visualisation;
            this.accordionState = {};

            this.dimensions = _(this.model.get('dimensions')).map(function (dimension, index) {
                return new NavigationDimensionView({
                    navigation: this,
                    dimension: dimension,
                    index: index
                });
            }, this);
        },

        render: function () {
            this.$el.html(this.template(this.model.attributes));
            var $accordion = this.$('.accordion');

            _.each(this.dimensions, function(dimension) {
                $accordion.append(dimension.render().el);
            }, this);

            // Show reset if there is a cut on the filter dimensions
            for (var i = 0; i < this.model._fields.length; i++) {
                if(this.model.isCut(i)) {
                    this.$('.container-icon').addClass('in');
                    this.$('.remove-filter').tipsy({gravity: 's'});
                }
            }

            /*
             * Set the style for the filter DOM elements depending on the
             * current cut set.
             */
            var styles = this.visualisation.styles;

            // DOM elements related to dimensions not included in the cut
            this.$('.table .dimension-cut .cut-label').css('color', styles.getStyle('featureFill', this.model));
            this.$('.table .cut-totals').css('color', styles.getStyle('featureFill', this.model));

            // DOM elements related to:
            //  - dimensions included in the cut
            //  - values that are not cut values
            this.$('.table.cut .dimension-cut .cut-label').css('color', styles.getStyle('featureFillActive', this.model));
            this.$('.table.cut .cut-totals').css('color', styles.getStyle('featureFillActive', this.model));

            // DOM elements related to:
            //  - dimensions included in the cut
            //  - values that are cut values
            this.$('.table.cut .active .dimension-cut .cut-label').css('color', styles.getStyle('featureFill', this.model));
            this.$('.table.cut .active .cut-totals').css('color', styles.getStyle('featureFill', this.model));

            /*
             * Set the style for the DOM elements that do not visually depend on
             * the cut
             */
            this.$('.dimension-filter .num-selected').css('color', styles.getStyle('featureFill', this.model));

            return this;
        },

        getDimension: function (dimension, index) {
            var id = dimension.field.id,
                field = this.visualisation.dataset.fields.findWhere({id: id}),
                cut = this.model.getCut(index),

                // Get sort
                sort = !_.isUndefined(dimension.sort) ? dimension.sort : {total: 'desc'},
                sortProperty = _.keys(sort)[0],

                // Merge observation values with dimension labels
                values = _.chain(this.model.getObservations(id))
                    .map(function (d) {
                        return _.extend(
                            {
                                total: d.total,
                                totalFormat: format.num(d.total)
                            },
                            this.model.getLabel(d, index)
                        );
                    }, this)
                    // Ignore observations with a value of 0
                    .filter(function (value) {return value.total > 0;})
                    .indexBy('id')
                    .sortBy(sortProperty)
                    .value();

            if (sort[sortProperty] === 'desc') {
                values.reverse();
            }

            var values_ids = _.keys(values),
                values_count = values_ids.length;

            return {
                id: id,
                accordion_id: this.model.get('id') + '_' + id.replace(/[^a-z0-9_\-]/gi, '_'),
                label: _.isUndefined(field) ? this.model.get('label') : field.get('label'),
                cut: this.model.getCut(index),
                values_count : values_count,
                selected_count : _.isUndefined(cut) ? values_count : _.intersection(cut, values_ids).length,
                state: (this.accordionState[id] === true),
                values: values,
                dataset: this.visualisation.dataset,
                format: format
            };
        },

        toggleAccordion: function(e) {
            var id = $(e.currentTarget).parents('.accordion-group').data('dimension');
            this.accordionState[id] = (this.accordionState[id] !== true);
        },

        toggleCut: function (e) {
            e.preventDefault();
            var $cut = $(e.currentTarget),
                dimension = $cut.parents('.filter-group').data('dimension'),
                cutData = $cut.data('value').value;

            if ($cut.closest('.cut-wrapper').hasClass('active')) {
                this.visualisation.dataset.removeCut([dimension], [cutData]);
            } else {
                this.visualisation.dataset.addCut(_.object([dimension], [cutData]), true);
            }
        }

    });

    return NavigationElementView;

});
