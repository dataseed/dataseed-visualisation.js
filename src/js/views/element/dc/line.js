define(['underscore', 'jquery', 'dc', 'd3', './chart', '../../../lib/format'],
    function(_, $, dc, d3, DcChartView, format) {
    'use strict';

    var LineChartView = DcChartView.extend({

        dcChartConstructor : dc.lineChart,
        tooltipSelector: 'g circle.dot',
        dataFeatureSelector: 'circle',

        /**
         * Override DcChartView.getDCDatumFromObservation
         * Data translation helpers: dc.lineChart uses a different format
         */
        getDCDatumFromObservation: function(o) {
            var obsLabel = this.model.getLabel(o),
                xLabel = o.id;

            // If the field type is not 'date' use labels, if possible
            if (this.model.getFieldType() !== 'date') {
                if (!_.isUndefined(obsLabel.short_label)) {
                    xLabel = obsLabel.short_label;
                } else if (!_.isUndefined(obsLabel.label)) {
                    xLabel = obsLabel.label;
                }
            }

            return {
                data: {key: o.id, value: o.total},
                layer: this.model.getMeasureLabel(),
                key: o.id,
                x: xLabel,
                y: o.total,
                y0: 0
            };
        },

        /**
         * Override DcChartView.getObservationFromDCDatum
         */
        getObservationFromDCDatum: function(d) {
            return {id: d.data.key, total: d.data.value};
        },

        /**
         * Build the chart's data.
         * Dc LineChart requires data defined as an array of layers (which,
         * in turn, are defined through crossfilter groups) and assumes that
         * there is at least one layer.
         */
        getChartData: function() {
            var layers = [],
                layerValues = _.map(this.model.getObservations(), function (d) {
                    return this.getDCDatumFromObservation(d);
                }, this);

            if (layerValues.length > 0) {
                layers.push({
                    name: this.model.getMeasureLabel(),
                    values: layerValues
                });
            }

            return layers;
        },

        /**
         * Set the proper scale for the X axis
         */
        prepareXaxis: function() {
            // Note we don't have to set the scale domain: it will be handled
            // by prepareXAxis() in dc.coordinateGridMixin
            if (this.model.getFieldType() === 'date') {
                this.chart.x(d3.time.scale.utc())
                    .xUnits(d3.time.seconds);
            } else {
                this.chart.x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal);
            }
        },

        /**
         * Override DcChartView.prepareChart
         */
        prepareChart: function(data) {
            DcChartView.prototype.prepareChart.apply(this, arguments);
            this.chart.on('renderlet.attachOnClick', this.attachOnClick);
            this.chartHeight = this.height;
            this.prepareXaxis();
        },

        /**
         * Attach the DC onClick event handler
         *
         * Dc line charts, by default, handle the double click on the data
         * points instead of the 'click' event that we want. Moreover it
         * seems that the double click doesn't even trigger the call to
         * this.chart.filter() (which is called by _chart.onClick() in
         * MixinBase): we need this.chart.filter() to be called because
         * otherwise we can't trigger our feature click flow (see
         * DcChartView.initChart()).
         */
        attachOnClick: function(chart) {
            chart.svg().selectAll('circle').on('click', chart.onClick);
        },

        /**
         * Override DcChartView.initChart
         */
        initChart: function() {
            // Set margins on initialisation as yAxixLabel() alters them and
            // the object is shared across instances
            this.margins = {top: 5, left: 50, right: 10, bottom: 70};

            DcChartView.prototype.initChart.apply(this, arguments);
            this.chart
                .renderArea(false)
                .elasticY(true)
                .elasticX(true)
                .renderHorizontalGridLines(true)
                .brushOn(false)
                .yAxisLabel(this.model.getMeasureLabel(), 25)

                // Don't set the titles: we attach our own tooltips
                // (see DcChartView.setupTooltips()
                .title($.noop)

                // Set opacity and radius of the data points (circles).
                // See drawDots(), hideDots() and showDots() in dc.lineChart()
                // to figure out how these values are used.
                .renderDataPoints({strokeOpacity: 0.5, fillOpacity: 1, radius: 3})

                // We need this call because otherwise we can't properly set the
                // circle colors due to the "fill" attr set by drawDots() in
                // dc.lineChart()
                .ordinalColors([this.getStyle('featureActive')])

                // tweak the padding for the clip path - see dc.coordinateGridMixin
                .clipPadding(5);

            this.chart.yAxis().tickFormat(format.numScale);
        },

        /**
         * Set chart styles
         */
        applyStyles: function() {
            // See also the call to this.chart.ordinalColors() in this.initChart()
            this.chart.svg().selectAll('g.axis.x text')
                .attr('transform', 'rotate(-45)')
                .attr('dy', '0.8em')
                .attr('dx', '-2em');

            // Ref lines
            this.chart.svg()
                .selectAll('g.dc-tooltip path')
                .style('fill', this.getStyle('featureFill'))
                .style('stroke', this.getStyle('featureFill'));

            // line
            var lineStyle = (this.model.isCut()) ? 'featureFillActive' : 'featureFill';
            this.chart.svg()
                .selectAll('path.line')
                .style('stroke', this.getStyle(lineStyle))
                .style('fill', 'none')
                .style('stroke-width', 2);

            // dots
            // DC line charts don't use the "selected"/"deselected" classes
            // (see drawDots() in dc.lineChart())
            this.chart.svg().selectAll(this.dataFeatureSelector)
                .classed('deselected', _.bind(function (d) {
                    return this.model.isCut() && !this.model.hasCutId(d.key);
                }, this));
        },

        /**
         * Set chart measure label
         */
        updateMeasureLabel: function() {
            this.chart.yAxisLabel(this.model.getMeasureLabel(), 25);
        }

    });

   return LineChartView;

});
