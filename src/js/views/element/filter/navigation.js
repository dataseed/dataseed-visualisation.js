define(['backbone', 'underscore', '../../../lib/format', 'text!../../../templates/element/filter/navigationDimension.html', 'text!../../../templates/element/filter/navigationElement.html', 'bootstrap_collapse'],
    function (Backbone, _, format, navigationDimensionTemplate, navigationElementTemplate) {
    'use strict';

    var NavigationDimensionView = Backbone.View.extend({

        normaliseRegex: /[^a-z0-9_\-]/gi,

        template: _.template(navigationDimensionTemplate),

        initialize: function(opts) {
            this.dataset = opts.dataset;
            this.navigation = opts.navigation;
            this.model = opts.model;
            this.dimension = opts.dimension;
            this.index = opts.index;
        },

        /**
         * Render a dimension as part of a navigation element
         */
        render: function() {
            var id = this.dimension.field.id,
                field = this.dataset.fields.findWhere({id: id}),
                cut = this.model.getCut(this.index),

                // Get sort
                sort = !_.isUndefined(this.dimension.sort) ? this.dimension.sort : {total: 'desc'},
                sortProperty = _.keys(sort)[0],

                // Merge observation values with dimension labels
                values = _.chain(this.model.getObservations(id))
                    .map(function (d) {
                        return _.extend(
                            {
                                total: d.total,
                                totalFormat: format.num(d.total)
                            },
                            this.model.getLabel(d, this.index)
                        );
                    }, this)
                    .filter(function (value) {return value.total > 0;})
                    .sortBy(sortProperty)
                    .value(),

                // Get value IDs
                ids = _.pluck(values, 'id');

            // Set sort direction
            if (sort[sortProperty] === 'desc') {
                values.reverse();
            }

            // Render
            this.$el.html(this.template({
                id: id,
                accordion_id: this.model.get('id') + '_' + id.replace(this.normaliseRegex, '_'),
                state: (this.navigation.accordionState[id] === true),
                cut: cut,
                label: _.isUndefined(field) ? this.model.get('label') : field.get('label'),
                values_count : ids.length,
                selected_count : (cut.length < 1) ? ids.length : _.intersection(cut, ids).length,
                values: values,
                dataset: this.dataset,
                format: format
            }));
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
                    dataset: this.visualisation.dataset,
                    navigation: this,
                    model: this.model,
                    dimension: dimension,
                    index: index
                });
            }, this);
        },

        /**
         * Render navigation element
         */
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

        /**
         * Hide/show a dimension
         */
        toggleAccordion: function(e) {
            var id = $(e.currentTarget).parents('.accordion-group').data('dimension');
            this.accordionState[id] = (this.accordionState[id] !== true);
        },

        /**
         * Handle a dimension value click
         */
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
