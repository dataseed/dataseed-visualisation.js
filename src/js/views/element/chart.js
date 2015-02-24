define(['backbone', 'underscore', 'jquery', 'd3', '../../lib/format', 'text!../../templates/element/chart.html', 'tipsy'],
    function(Backbone, _, $, d3, format, chartTemplate) {
    'use strict';

    var ChartView = Backbone.View.extend({

        className: 'inner-element',

        template: _.template(chartTemplate),

        events: {
            'mouseover g': 'removeTooltips'
        },

        initialize: function(options) {
            // Listen to changes in chart label
            this.listenTo(this.model, 'change:label', this.updateChartLabel);
        },

        /**
         * Default render functionality
         */
        render: function() {
            // Only render template on first invocation
            if (!this.container) {
                this.$el.html(this.template(this.model.attributes));
                this.$heading = this.$('h2');
                this.$container = this.$('.chart-container');
                this.container = this.$container.get(0);
            }

            // Set custom colours
            var styles = this.model.visualisation.styles;
            this.$el.css('background-color', styles.getStyle('background'));
            this.$heading.css({
                'color': styles.getStyle('heading'),
                'border-color': styles.getStyle('visualisationBackground')
            });

            // Set chart size
            this.width = this.$container.width();
            this.height = this.$el.height() - this.$heading.outerHeight(true);
            this.$container.height(this.height);

            return this;
        },

        updateChartLabel: function(){
            this.$heading.text(this.model.get('label'));
        },

        /**
         * Set all chart features
         */
        setFeatures: function() {
            // Set chart status
            d3.select(this.container)
                .select('svg')
                    .classed('inactive', _.bind(this.model.isCut, this.model));

            // Set feature statuses
            d3.select(this.container)
                .select('svg')
                    .selectAll('g rect, .node circle')
                        .style('fill', this.getStyle('featureFill'))
                        .style('stroke', this.getStyle('featureStroke'));
        },

        /**
         * Handle a chart feature click
         */
        featureClick: function(d, i) {
            if (this.model.featureClick(d, i)) {
                this.setFeatures();
            }
        },

        /**
         * Helper function to calculate a string's width in pixels
         */
        getStringWidth: function(str) {
            return this.getStringSize(str).width;
        },

        /**
         * Returns true if the feature related to d is not big enough to
         * contain the label
         */
        ignoreLabel: function(d, i, label){
            return this.getStringWidth(label) > this.getFeatureWidth(d, i);
        },

        /**
         * Get a chart feature's label
         */
        getFeatureLabel: function(d, i) {
            // Get this feature's label
            var label = this.model.getLabel(d);
            if (!label) {
                return;
            }

            // If there's a short label, use it
            label = (_.isUndefined(label.short_label)) ? label.label : label.short_label;

            // Ignore labels that are longer than the diameter of the bubble
            if (this.ignoreLabel(d, i, label)) {
                return;
            }

            return label;
        },

        /**
         * Helper function to calculate a string's width and height in pixels
         */
        getStringSize: function (str) {
            var fontSize = parseFloat(this.$el.css('font-size'));
            return {height: fontSize, width: str.length * fontSize / 2};
        },

        /**
         * Get style function for the specified type
         */
        getStyle: function(type) {
            return _.bind(this.model.visualisation.styles.getStyle, this.model.visualisation.styles, type, this.model);
        },

        /**
         * Get a measure
         */
        getMeasure: function(d) {
            return d.total;
        },

        /**
         * Get a tooltip label
         */
        getTooltip: function(d, i) {
            var value = this.model.getObservationById(d.id);
            if (!value) {
                return;
            }
            var valueLabel = this.model.getLabel(d),
                label = '';
            if (valueLabel && valueLabel.label) {
               label += valueLabel.label + ': ';
            }
            label += format.num(value.total);
            return label;
        },

        /**
         * Attach Tipsy tooltips to requested element
         */
        attachTooltips: function(selector) {
            this.$el.find('svg ' + selector).tipsy({gravity: 's'});
        },

        /**
         * Remove tooltips
         */
        removeTooltips: function() {
            if($('.tipsy').length > 0) {
                $('.tipsy:gt(0)').remove();
            }
        }

    });

    return ChartView;

});
