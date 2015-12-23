define(['underscore', 'dc', './dcChart'],
    function(_, dc, DcChartView) {
    'use strict';

    /**
     * Dc.js Bar Chart (Horizontal)
     */
    var BarChartView = DcChartView.extend({

        dcChart: dc.rowChart,
        tooltipSelector: 'g.row',
        dataFeatureSelector: 'g.row rect',

        barHeight: 30,
        minBarHeight: 1,

        margins: {top: 0, left: 25, right: 25, bottom: 70},

        scaleTicks: 4,

        /**
         * Override DcChartView.initChart
         */
        initChart: function() {
            return DcChartView.prototype.initChart.apply(this, arguments)
                // Set margins
                .margins(_.clone(this.margins))

                // Auto-scale X axis
                .elasticX(true);
        },

        /**
         * Override DcChartView.prepareChart
         */
        prepareChart: function() {
            DcChartView.prototype.prepareChart.apply(this, arguments);

            // Resize chart
            if (this.getFeatureHeight() < this.minBarHeight) {
                // Overflow the chart's container height
                this.chartHeight = this.chart.data().length * this.barHeight;
            } else {
                // Fit chart within container
                this.chartHeight = this.height;
            }
            this.chart.height(this.chartHeight);

            // Setup x-axis scale
            this.chart.xAxis()
                .ticks(this.scaleTicks)
                .tickFormat(this.model.getMeasureFormatter('scale'));

            // Update x-axis position
            if (this.chart.svg()) {
                this.chart.svg().select('g.axis')
                    .attr('transform', 'translate(0, ' + (this.chartHeight - this.margins.bottom) + ')');
            }
        },

        /**
         * Override DcChartView.renderChart
         * We need to attach the measure label right after the chart is
         * rendered from scratch: DC row chart doesn't allow to set the
         * xAxis label
         */
        renderChart: function() {
            DcChartView.prototype.renderChart.apply(this, arguments);
            this.updateMeasureLabel();
        },

        /**
         * Set chart styles
         */
        styleChart: function(svg) {
            DcChartView.prototype.styleChart.apply(this, arguments);

            this.$container.css({
                'overflow-y': 'auto',
                'overflow-x': 'hidden'
            });

            svg.selectAll('g.row text')
                .attr('fill', null)
                .style('fill', this.getStyle('label'));
        },

        /**
         * Implement getFeatureHeight()
         */
        getFeatureHeight: function() {
            return (this.chart.effectiveHeight() - (this.chart.data().length + 1) * this.chart.gap()) / this.chart.data().length;
        },

        /**
         * Set chart measure label
         */
        updateMeasureLabel: function() {
            this.chart.svg().select('.scaleLabel').remove();

            // Set measure label
            this.chart.svg().append('text')
                .attr('class', 'scaleLabel')
                .attr('text-anchor', 'middle')
                .attr('x', (this.width - (this.margins.left + this.margins.right)) / 2)
                .attr('y', this.chartHeight - this.margins.bottom / 2)
                .attr('dy', 15)
                .style('fill', this.getStyle('measureLabel'))
                .text(this.model.getMeasureLabel());
        }

    });

    return BarChartView;

});
