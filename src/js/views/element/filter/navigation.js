define(['backbone', 'underscore', 'jquery', '../../../lib/format', 'text!../../../templates/element/filter/navigationDimension.html', 'text!../../../templates/element/filter/navigationElement.html', 'bootstrap_collapse'],
    function (Backbone, _, $, format, navigationDimensionTemplate, navigationElementTemplate) {
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
            var id = this.dimension.get('field'),
                field = this.dataset.fields.findWhere({id: id}),
                index = this.index,
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
                index: index,
                accordion_id: this.model.get('id') + '_' + id.replace(this.normaliseRegex, '_'),
                state: (this.navigation.accordionState[id] === true),
                cut: cut,
                label: _.isUndefined(field) ? this.model.get('settings').get('label') : field.get('label'),
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

        className: "inner-element",

        height: 400,

        events: {
            'click td .dimension-cut input': 'toggleCut',
            'click h3 a': 'toggleAccordion'
        },

        template: _.template(navigationElementTemplate),

        initialize: function(options) {
            this.visualisation = options.visualisation;
            this.accordionState = {};
            this.numberOfObservations = {};

            this.dimensions = this.model.dimensions.map(function (dimension, index) {
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

            /*
             * Set the style for the filter DOM elements depending on the
             * current cut set.
             */
            var styles = this.visualisation.styles;

            // Only get number of observations once.
            if (!this._calculated) {
                this.model.dimensions.each(function(dimension, index) {
                    var dimensionId = dimension.get('field');
                    // Get the total number of observations for each dimension.
                    this.numberOfObservations[dimensionId] = this.model.getObservations(dimensionId).length;
                }, this);

                this._calculated = true;
            }

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

            // Calculate the height of the accordion
            var accordionHeight = this.height - this.$('h2').outerHeight();
            $accordion.css('height', accordionHeight);

            /*
             * Set the style for the DOM elements that do not visually depend on
             * the cut
             */
            this.$('.dimension-filter .num-selected').css('color', styles.getStyle('featureFill', this.model));

            // Set the background colour
            this.$el.css('background-color', styles.getStyle('background', this.model));

            // Set the element title colour
            this.$('h2').css('color', styles.getStyle('heading', this.model));
            this.$('h2').css('border-color', styles.getStyle('visualisationBackground', this.model));
            this.$('h3 a').css('color', styles.getStyle('heading', this.model));

            // Set the filter scale text
            this.$('h3 .filter-info').css('color', styles.getStyle('scaleFeature', this.model));

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
                dimensionIndex = $cut.parents('.filter-group').data('dimension-index'),
                cutData = this.model.buildCutArgs($cut.data('value').value, dimensionIndex),
                numberOfCuts = this.visualisation.dataset.getCut(dimension).length;

            if ($cut.closest('.cut-wrapper').hasClass('active')) {
                this.visualisation.dataset.removeCut([dimension], [cutData]);
            } else if (numberOfCuts === this.numberOfObservations[dimension] - 1) {
                this.visualisation.dataset.removeCut([dimension]);
            } else {
                this.visualisation.dataset.addCut(_.object([dimension], [cutData]), true);
            }
        }

    });

    return NavigationElementView;

});
