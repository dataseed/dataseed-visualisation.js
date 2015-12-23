define(['underscore', 'dc', 'd3', './dcChart'],
    function(_, dc, d3, DcChartView) {
    'use strict';

    /**
     * Dc.js Donut Chart
     */
    var DonutChartView = DcChartView.extend({

        dcChart: dc.pieChart,
        tooltipSelector: 'g.pie-slice',

        margin: 20,

        ignoreLabel: _.noop,

        /**
         * Override DcChartView.prepareChart
         */
        prepareChart: function() {
            DcChartView.prototype.prepareChart.apply(this, arguments);

            // Set radius to half the smallest dimension minus margins
            var radius = (Math.min(this.width, this.height) / 2) - this.margin;
            this.chart.radius(radius)
                .innerRadius(radius / 3);
        },

        /**
         * Override DcChartView.renderChart
         */
        renderChart: function() {
            DcChartView.prototype.renderChart.apply(this, arguments);
            this.updateMeasureLabel();
        },

        /**
         * Set chart styles
         */
        styleChart: function(svg) {
            // Style segments
            svg.selectAll('g.pie-slice path')
                .attr({fill: null, stroke: null})
                .style({
                    fill: this.getStyle('featureFill'),
                    stroke: this.getStyle('featureStroke')
                });

            // Style active segment
            svg.selectAll('g.deselected path')
                .style({
                    fill: this.getStyle('featureFillActive'),
                    stroke: this.getStyle('featureStrokeActive')
                });

            // Style segment labels
            svg.selectAll('text.pie-slice')
                .attr('fill', null)
                .style('fill', this.getStyle('label'));

            // TODO: Remove this hack and add an option to dc.pieChart
            // to allow labels for selected features to be hidden.
            // We also need to fix dc.pieChart so oversized labels aren't
            // shown. At the moment labels are shown if the angle of the
            // segment is less than minAngleForLabel().
            svg.selectAll('text.pie-slice').style('display', 'block');
            if (this.model.isCut()) {
                var segment = svg.select('g.pie-slice.selected'),
                    data = segment.data()[0],
                    angle = data.endAngle - data.startAngle;
                if (isNaN(angle) || angle < this.chart.minAngleForLabel()) {
                    var segmentId = _.find(segment.attr('class').split(/\s+/), function(cls) {
                        return cls.charAt(0) === '_';
                    });
                    svg.select('text.' + segmentId).style('display', 'none');
                }
            }

            // TODO: Remove this hack and fix dc.pieChart so segment labels are
            // contained with the segment group. Without this fix, tooltips aren't
            // shown when hovering over the label text.
            svg.selectAll('text.pie-slice').attr('pointer-events', 'none');
        },

        /**
         * Set chart measure label
         */
        updateMeasureLabel: function() {
            this.$container.css('margin-top', '-20px');
            this.chart.svg().select('.scaleLabel').remove();
            this.chart.svg().append('text')
                .attr('class', 'scaleLabel')
                .attr('text-anchor', 'middle')
                .attr('x', this.width / 2)
                .attr('y', this.height - 3)
                .style('fill', this.getStyle('measureLabel'))
                .text(this.model.getMeasureLabel());
        }

    });

    return DonutChartView;

});
