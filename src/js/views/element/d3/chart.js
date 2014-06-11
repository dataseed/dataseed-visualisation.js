define(['backbone', 'underscore', 'd3', '../../../lib/format', 'text!../../../templates/element/chart.html', 'tipsy'],
    function(Backbone, _, d3, format, chartTemplate) {
    'use strict';

    var ChartView = Backbone.View.extend({

        template: _.template(chartTemplate),

        events: {
            'mouseover g': 'mouseRemoveTips'
        },

        initialize: function(options) {
            // Get options
            this.$parent = options.parent;

            // Re-render the chart on resize (at most, every 300 milliseconds)
            $(window).resize(_.throttle(_.bind(this.render, this), 300));
        },

        /**
         * Default render functionality
         */
        render: function() {
            // Render template
            this.$el.html(this.template(this.model.attributes));

            // Set custom colours
            this.$el.css('background-color', this.model.visualisation.styles.getStyle('background'));
            this.$('h2').css('color', this.model.visualisation.styles.getStyle('heading'));

            // Get parent element width
            this.width = this.$parent.width();

            // Kepp reference to container DOM element for d3
            this.chartContainerEl = this.$('.chart-container').get(0);
            return this;
        },

        /**
         * Remove any lingering tooltips when the mouse leaves the chart
         */
        mouseRemoveTips : function() {
            if($('.tipsy').length > 0) {
                $('.tipsy:gt(0)').remove();
            }
        },

        /**
         * Reset all chart features
         */
        resetFeatures: function() {
            // Set chart status
            d3.select(this.chartContainerEl)
                .select('svg')
                    .classed('inactive', _.bind(this.model.isCut, this.model));

            // Set feature statuses
            d3.select(this.chartContainerEl)
                .select('svg')
                    .selectAll('g rect, .node circle')
                        .style('fill', this.getStyle('featureFill'))
                        .style('stroke', this.getStyle('featureStroke'));
        },

        /**
         * Handle a chart feature click
         */
        featureClick: function(d, i) {
            if (this.model.featureClick(i)) {
                this.resetFeatures();
            }
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
            var value = this.model.getObservation(i),
                valueLabel = this.model.getLabel(value),
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
         * Remove all tooltips
         */
        removeTooltips: function() {
            $('.tipsy').remove();
        },

        /**
         * Helper function to calculate a string's width in pixels
         */
        getStringWidth: function(str) {
            var html = $('<span>' + str + '</span>')
                .css('font-size', this.$el.css('font-size'))
                .hide()
                .prependTo('body');
            var width = html.width();
            html.remove();
            return width;
        }

    });

    return ChartView;

});
