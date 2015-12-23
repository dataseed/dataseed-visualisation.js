define(['underscore', 'dc', 'd3', './dcChart', '../../../lib/format'],
    function(_, dc, d3, DcChartView, format) {
    'use strict';

    /**
     * Dc.js Column Chart (Vertical)
     */
    var ColumnChartView = DcChartView.extend({

        dcChart: dc.barChart,
        tooltipSelector: 'rect.bar',
        dataFeatureSelector: 'rect.bar',

        margins: {top: 5, left: 50, right: 10, bottom: 70},

        // Always show labels
        ignoreLabel: _.noop,

        /**
         * Override DcChartView.initChart
         */
        initChart: function() {
            return DcChartView.prototype.initChart.apply(this, arguments)
                // Auto-scale axes
                .elasticX(true)
                .elasticY(true)

                // Set margins
                .margins(_.clone(this.margins))

                // No brush
                .brushOn(false)

                // Use ordinal scale for x-axis
                .x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal);
        },

        /**
         * Override DcChartView.prepareChart
         */
        prepareChart: function() {
            DcChartView.prototype.prepareChart.apply(this, arguments);

            // Setup x-axis
            if (this.model.getFieldType() === 'date' && !this.model.isBucketed()) {
                // Use d3's date/time scale formatter
                this.chart.xAxis()
                    .tickFormat(_.bind(format.dateScale, format));
            } else {
                // Otherwise, use standard feature labels
                this.chart.xAxis()
                    .tickFormat(_.bind(this.getFeatureLabel, this));
            }

            // Setup y-axis
            this.chart.yAxis()
                .tickFormat(this.model.getMeasureFormatter('scale'));

            // Set y-axis label
            this.updateMeasureLabel();

            // Re-scale chart in case the canvas size has changed
            this.chart.rescale();

            // TODO: Remove this hack to fix sorting when using
            // a date dimension once the following bug has been fixed:
            // https://github.com/dc-js/dc.js/issues/598
            var sort = this.model.getSort();
            if (this.model.getFieldType() === 'date' && sort) {
                var sortDirection = (this.model.get('settings').get('sort_direction') === 'asc') ? 1 : -1;
                this.chart.ordering(function(d) {
                    return d[sort] * sortDirection;
                });
            }
        },

        /**
         * Override ChartView.getFeatureLabel
         */
        getFeatureLabel: function(id) {
            return DcChartView.prototype.getFeatureLabel.call(this, {id: id});
        },

        /**
         * Set chart styles
         */
        styleChart: function(svg) {
            DcChartView.prototype.styleChart.apply(this, arguments);

            // X-Axis labels
            svg.selectAll('g.axis.x text')
                .attr('transform', 'rotate(-45)')
                .attr('dy', '0.8em')
                .attr('dx', '-2em');

            // Brush
            svg.selectAll('g.brush')
                .style('opacity', '0.6');
        },

        /**
         * Set chart measure label (Y-Axis)
         */
        updateMeasureLabel: function() {
            this.chart.yAxisLabel(this.model.getMeasureLabel(), 25);
        }

    });

    return ColumnChartView;

});
