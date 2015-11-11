define(['underscore', 'jquery', '../chart'],
    function(_, $, ChartView) {
    'use strict';

    /**
     * Dc.js Chart Base Class
     *
     * Sub-classes must implement:
     *   dcChart: Dc.js chart constructor
     *   tooltipSelector: Selector for tooltip hover area
     *   dataFeatureSelector: Selector for chart feature (e.g. a bar)
     *   updateMeasureLabel: Event handler for measure label change
     *
     * Sub-classes may override:
     *   initChart: Create chart
     *   prepareChart: Prepare chart for rendering
     *   renderChart: Render chart
     *   styleChart: Apply chart styles
     */
    var DcChartView = ChartView.extend({

        // Default margins
        margins: {top: 0, left: 10, right: 10, bottom: 50},

        // Features are styled by Dc
        setFeatures: _.noop,

        /**
         * Initialise chart
         */
        initialize: function(options) {
            ChartView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.get('settings'), 'change:measure_label', this.updateMeasureLabel);
        },

        /**
         * Render chart
         */
        render: function() {
            ChartView.prototype.render.apply(this, arguments);

            // Create chart
            if (!this.chart) {
                this.chart = this.initChart();
            }

            // Prepare
            this.prepareChart();

            // Render
            this.renderChart();

            // Style
            this.styleChart(this.chart.svg());

            return this;
        },

        /**
         * Initialise chart
         */
        initChart: function() {
            // Set initial chart height
            this.chartHeight = this.height;

            // Set chart ID
            this.$container.attr('id', this.model.get('id') || this.model.cid);

            // Create chart
            var chart = this.dcChart(this.container);

            // Override hasFilter() and filter()
            chart.hasFilter = _.bind(this.hasFilter, this);
            chart.filter = _.bind(this.filter, this);

            chart
                // Set chart margins
                .margins(_.clone(this.margins))

                // Data
                .dimension({filter: _.noop})
                .group({all: _.bind(this.model.getObservations, this.model)})

                // Accessors
                .keyAccessor(_.property('id'))
                .valueAccessor(_.property('total'))

                // Labels
                .label(_.bind(this.getFeatureLabel, this))

                // Tooltips
                .title(_.bind(this.getTooltip, this))

                // Auto-scale X axis
                .elasticX(true);

            return chart;
        },

        /**
         * Override DC method to check if a chart is filtered
         */
        hasFilter: function(filter) {
            return _.isUndefined(filter) ? this.model.isCut() : this.model.hasCutId(filter);
        },

        /**
         * Override DC method to apply a filter to a chart
         */
        filter: function(value) {
            this.featureClick({id: value});
        },

        /**
         * Apply the settings required to draw the chart
         */
        prepareChart: function() {
            this.chart
                .width(this.width)
                .height(this.height);
        },

        /**
         * Render the DC chart
         */
        renderChart: function() {
            if (!this.chart.svg()) {
                // Render
                this.chart.render();
            } else {
                // Re-render
                this.chart.svg().attr({
                    width: this.width,
                    height: this.chartHeight
                });
                this.chart.redraw();
            }

            // Attach tooltips using tipsy
            this.$el.find('svg ' + this.tooltipSelector).tipsy({
                gravity: 's',
                title: function() {
                    return $(this).children('title').text();
                }
            });
        },

        /**
         * Helper method to reset all the chart features styles
         */
        styleChart: function(svg) {
            // Set chart status
            svg.classed('inactive', _.bind(this.model.isCut, this.model));

            // Reset chart's features: remove all the style-related attr
            // applied by DC
            svg.selectAll(this.dataFeatureSelector)
                .attr({fill: null, stroke: null})
                .style('fill', this.getStyle('featureFill'))
                .style('stroke', this.getStyle('featureStroke'));

            // Axis (Scale)
            svg.selectAll('g.axis path')
                .style('fill', 'none')
                .style('stroke', this.getStyle('scaleFeature'));

            // Ticks
            svg.selectAll('g.tick')
                .select('line')
                .style('fill', 'none')
                .style('stroke', this.getStyle('scaleFeature'));

            // Tick labels
            svg.selectAll('g.tick text')
                .style('fill', this.getStyle('scaleFeature'));

            // Axis labels
            svg.select('text.y-axis-label, text.scaleLabel')
                .style('fill', this.getStyle('scaleFeature'));

            /*
             * If a filter (dataset cut) is set for the chart, DC assigns to
             * each data feature the class:
             *  - "selected" if the feature refers to the value the chart is
             *  filtered on
             *  - "deselected" otherwise
             *
             * The chart's features (both the "selected" ones and the ones
             * related to a non-filtered chart) are styled by setting
             * this.dataFeatureSelector (see above). Thus here we just need to
             * set the style for the features classed as "deselected"
             */
            svg.selectAll('.deselected')
                .style('fill', this.getStyle('featureFillActive'))
                .style('stroke', this.getStyle('featureStrokeActive'));
        },

        /**
         * Get style function for the specified type
         */
        getStyle: function(type) {
            /* With almost all the DC charts we don't need to use the getStyle
             * method of the styles collection because we don't need to check
             * whether a feature is "active" or not: chart's features get a
             * proper class if they are included in the current cut - see
             * this.styleChart()
             * Note: line charts represent one of the few exceptions for this
             * class assignment pattern.
             */
            return this.model.visualisation.styles.lookupStyle(type);
        },

        /**
         * Override ChartView.ignoreLabel()
         */
        ignoreLabel: function(d, i, label) {
            var stringDim = this.getStringSize(label);

            // Ignore labels that are longer than the chart's width or higher
            // than the related chart's feature
            return (stringDim.width > this.chart.effectiveWidth() || stringDim.height > this.getFeatureHeight());
        }

    });

    return DcChartView;

});
