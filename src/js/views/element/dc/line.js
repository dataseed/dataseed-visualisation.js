define(['underscore', 'dc', 'd3', './dcChart'],
    function(_, dc, d3, DcChartView) {
    'use strict';

    /**
     * Dc.js Line Chart
     */
    var LineChartView = DcChartView.extend({

        dcChart: dc.lineChart,
        tooltipSelector: 'g circle.dot',
        dataFeatureSelector: 'circle',

        margins: {top: 5, left: 50, right: 10, bottom: 70},

        /**
         * Override DcChartView.initChart
         */
        initChart: function() {
            var chart = DcChartView.prototype.initChart.apply(this, arguments);

            // Setup chart
            chart
                // Auto-scale axes
                .elasticX(true)
                .elasticY(true)

                // Set margins
                .margins(_.clone(this.margins))

                // No area or brush
                .renderArea(false)
                .brushOn(false)

                // Set opacity and radius of the data points (circles).
                // See drawDots(), hideDots() and showDots() in dc.lineChart()
                // to figure out how these values are used.
                .renderDataPoints({strokeOpacity: 0.5, fillOpacity: 1, radius: 3})

                // We need this call because otherwise we can't properly set the
                // circle colors due to the "fill" attr set by drawDots() in
                // dc.lineChart()
                .ordinalColors([this.getStyle('featureActive')])

                // Tweak the padding for the clip path - see dc.coordinateGridMixin
                .clipPadding(5);

            // Attach onClick handler after rendering
            //
            // Dc line charts, by default, handle the double click on the data
            // points instead of the 'click' event that we want. Moreover it
            // seems that the double click doesn't even trigger the call to
            // this.chart.filter() (which is called by _chart.onClick() in
            // MixinBase): we need this.chart.filter() to be called because
            // otherwise we can't trigger our feature click flow (see
            // DcChartView.initChart()).
            chart.on('renderlet.attachOnClick', function(chart) {
                chart.svg().selectAll('circle').on('click', function(d) {
                    chart.onClick(d.data);
                });
            });

            return chart;
        },

        /**
         * Override ChartView.getFeatureLabel
         */
        getFeatureLabel: function(id) {
            return DcChartView.prototype.getFeatureLabel.call(this, {id: id});
        },

        /**
         * Override DcChartView.ignoreLabel
         */
        ignoreLabel: _.constant(false),

        /**
         * Override DcChartView.prepareChart
         */
        prepareChart: function() {
            DcChartView.prototype.prepareChart.apply(this, arguments);

            // Use date scale for x-axis
            if (this.model.getFieldType() === 'date') {
                this.chart.x(d3.time.scale.utc())
                    .xUnits(d3.time.seconds)
                    .xAxis()
                        .tickFormat(null);

            // Use ordinal scale for x-axis
            } else {
                this.chart.x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    .xAxis()
                        .tickFormat(_.bind(this.getFeatureLabel, this));
            }

            // Setup y-axis scale
            this.chart.yAxis()
                .tickFormat(this.model.getMeasureFormatter('scale'));

            // Set y-axis label
            this.updateMeasureLabel();
        },

        /**
         * Set chart styles
         */
        styleChart: function(svg) {
            // See also the call to this.chart.ordinalColors() in this.initChart()
            svg.selectAll('g.axis.x text')
                .attr('transform', 'rotate(-45)')
                .attr('dy', '0.8em')
                .attr('dx', '-2em');

            // Ref lines
            svg.selectAll('g.dc-tooltip path')
                .style('fill', this.getStyle('featureFill'))
                .style('stroke', this.getStyle('featureFill'));

            // Line
            svg.selectAll('path.line')
                .style('stroke', this.getStyle('featureFill' + ((this.model.isCut()) ? 'Active' : '')))
                .style('fill', 'none')
                .style('stroke-width', 2);

            // Circles
            // DC line charts don't use the "selected"/"deselected" classes
            // (see drawDots() in dc.lineChart())
            svg.selectAll(this.dataFeatureSelector)
                .classed('deselected', _.bind(this.isDeselected, this));

            DcChartView.prototype.styleChart.apply(this, arguments);
        },

        /**
         * Return true if chart has a cut but not for the passed value
         */
        isDeselected: function(d) {
            return this.model.isCut() && !this.model.hasCutId(d.data.id);
        },

        /**
         * Set chart measure label (Y-Axis)
         */
        updateMeasureLabel: function() {
            this.chart.yAxisLabel(this.model.getMeasureLabel(), 25);
        }

    });

   return LineChartView;

});
