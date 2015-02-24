define(['underscore', 'jquery', 'dc', './chart', '../../../lib/format'],
    function(_, $, dc, DcChartView, format) {
    'use strict';

    var BarChartView = DcChartView.extend({

        dcChartConstructor: dc.rowChart,

        barHeight: 30,
        minBarHeight: 1,

        margins: {top: 0, left: 10, right: 10, bottom: 70},

        tooltipSelector: 'g.row',
        dataFeatureSelector: 'g.row rect',

        scaleTicks: 4,

        /**
         * Override DcChartView.initChart
         */
        initChart: function() {
            DcChartView.prototype.initChart.apply(this, arguments);

            this.chart
                // Don't set the titles: we attach our own tooltips
                // (see DcChartView.setupTooltips()
                .title($.noop)
                .elasticX(true)

                // Add feature labels
                .label(_.compose(
                    _.bind(this.getFeatureLabel, this),
                    _.bind(this.getObservationFromDCDatum, this)
                ))

                // Setup x-axis scale
                .xAxis()
                    .ticks(this.scaleTicks)
                    .tickFormat(format.numScale);

            this.resizeChartHeight();
        },

        /**
         * Override DcChartView.renderChart
         * We need to attach the measure label right after the chart is
         * rendered from scratch: DC row chart doesn't allow to set the
         * xAxis label
         */
        renderChart: function() {
            this.chart.render();
            this.addMeasureLabel();
        },

        /**
         * Override DcChartView.redrawChart
         */
        redrawChart: function() {
            if (!this._moveAxis) {
                this._moveAxis = true;
            }

            this.resizeChartHeight();

            DcChartView.prototype.redrawChart.apply(this, arguments);

            this.chart.svg().select('.scaleLabel').remove();
            this.addMeasureLabel();
        },

        /**
         * Set chart height, allowing overflow (scrolling)
         */
        resizeChartHeight: function() {
            if (this.getBarHeight() < this.minBarHeight) {
                // Overflow the chart's container height
                this.chartHeight = this.chart.data().length * this.barHeight;
            } else {
                // Fit chart within container
                this.chartHeight = this.height;
            }
            this.chart.height(this.chartHeight);

            if (this._moveAxis) {
                this.moveAxis();
            }
        },

        moveAxis: function() {
            this.chart.svg().select('g.axis')
                .attr('transform', 'translate(0, ' + (this.chartHeight - this.margins.bottom) + ')');
        },

        /**
         * Set chart styles
         */
        applyStyles: function() {
            this.$container.css({
                'overflow-y': 'auto',
                'overflow-x': 'hidden'
            });

            this.chart.svg()
                .selectAll('g.row text')
                .attr('fill', null)
                .style('fill', this.getStyle('label'));
        },

        /**
         * The following is the formula used by updateElements of
         * dc.rowCharts to calculate the row/bar height.
         *
         * We can't just get the svg height because this method has to be
         * invoked in this.initChart() - i.e. before the chart is rendered.
         * Moreover we have to use the same formula used by DC because we need
         * to know when DC is going to render a bar chart that is too big
         * for the available container (specifically this happens when DC
         * calculates the bar height as a negative value)
         */
        getBarHeight: function() {
            // TODO find a better way to handle this: if that formula will change in a future release of DC we will be calculating the bar height inconsistently with DC
            // options: do not use the value calculated by DC. Calculate an our own bar height value and set it via chart.fixedBarHeight().
            return (this.chart.effectiveHeight() - (this.chart.data().length + 1) * this.chart.gap()) / this.chart.data().length;
        },

        /**
         * Implement getFeatureHeight(): we invoke this.getFeatureLabel in
         * this.initChart()
         */
        getFeatureHeight: function() {
            return this.getBarHeight();
        },

        /**
         * Add the measure label to the chart
         */
        addMeasureLabel: function() {
            this.chart.svg().append('text')
                .attr('class', 'scaleLabel')
                .attr('text-anchor', 'middle')
                .attr('x', (this.width - (this.margins.left + this.margins.right)) / 2)
                .attr('y', this.chartHeight - this.margins.bottom / 2)
                .attr('dy', 15)
                .style('fill', this.getStyle('measureLabel'))
                .text(this.model.getMeasureLabel());
        },

        updateMeasureLabel: function() {
            this.chart.svg().select('.scaleLabel')
                .text(this.model.getMeasureLabel());
        }

    });

    return BarChartView;

});
