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
                .elasticY(true)
                .brushOn(false);
        },

        /**
         * Override DcChartView.prepareChart
         */
        prepareChart: function() {
            DcChartView.prototype.prepareChart.apply(this, arguments);

            // Setup X-Axis
            this.chart.x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal);
            this.chart.xAxis()
                .ticks(5)
                .tickFormat(_.bind(this.getFeatureLabel, this));

            this.updateMeasureLabel();
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
