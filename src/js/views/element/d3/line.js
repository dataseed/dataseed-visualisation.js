define(['./chart', 'underscore', 'd3', '../../../lib/format'],
    function (ChartView, _, d3, format) {
    'use strict';

    var LineChartView = ChartView.extend({

        // Axes
        yAxisHeight: 170,
        yAxisTicks: 5,

        // Points
        circleRadius: 3,

        // Gutters
        gutterTop: 10,
        gutterRight: 20,
        gutterLeft: 60,
        gutterBottom: 50,

        render: function () {

            // Setup chart: call the "super" render implementation
            ChartView.prototype.render.apply(this, arguments);

            // Get observations data
            var data = this.model.getObservations();
            if (data.length < 1) {
                // Don't render if there's no data
                return this;
            }

            var xScale, xAccessor,
                xRange = [0, this.width - (this.gutterLeft + this.gutterRight)];

            if (this.model.getFieldType() === 'date') {
                // Use a temporal scale for time dimension (X axis)
                var ids = _.pluck(data, 'id');

                xScale = d3.time.scale.utc()
                    .domain([d3.min(ids), d3.max(ids)])
                    .range(xRange);

                xAccessor = function (d) {
                    return xScale(d.id);
                };

            } else {
                // Use an ordinal scale for dimension labels (X axis)
                data = _.map(data, function(d) {
                    return _.extend({}, d, this.model.getLabel(d));
                }, this);

                xScale = d3.scale.ordinal()
                    .domain(_.pluck(data, 'label'))
                    .rangePoints(xRange);

                xAccessor = function (d) {
                    return xScale(d.label);
                };
            }

            // Use a linear scale for measure (Y axis)
            var yScale = d3.scale.linear()
                    .domain([0, d3.max(_.pluck(data, 'total'))])
                    .range([this.yAxisHeight, 0]),

                yAccessor = function (d) {
                        return yScale(d.total);
                    },

                // Create axes objects
                xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom'),

                yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left')
                    .ticks(this.yAxisTicks)
                    .tickFormat(format.numScale),

                // Create line object
                line = d3.svg.line()
                    .x(xAccessor)
                    .y(yAccessor),

                // Create line chart
                chartContainer = d3.select(this.chartContainerEl)
                    .append('svg')
                        .attr('width', this.width + this.gutterLeft)
                        .attr('class', 'lineChart')
                        .classed('inactive', _.bind(this.model.isCut, this.model)),

                chart = chartContainer.append('g')
                    .attr('transform', 'translate(' + this.gutterLeft + ',' + this.gutterTop + ')');

            // Draw X axis
            chart.append('g')
                .attr('class', 'x axis')
                // draw the x axis at the origin (zero)
                .attr('transform', 'translate(0,' + yScale(0) + ')')
                .call(xAxis)
                .selectAll('text')
                    .style('text-anchor', 'end')
                    .attr('transform', 'rotate(320 0,5)');

            // Draw Y axis
            chart.append('g')
                .attr('class', 'y axis')
                .call(yAxis)
                .append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('y', 0 - (this.gutterLeft / 1.5))
                    .attr('x', 0 - (this.yAxisHeight / 2))
                    .attr('text-anchor', 'middle')
                    .style('fill', this.getStyle('measureLabel'))
                    .text(this.model.getMeasureLabel());

            // Draw the line
            chart.append('path')
                .datum(data)
                .attr('class', 'line')
                .attr('d', line)
                .style('fill', 'none')
                .style('stroke', this.getStyle('featureFill'))
                .style('stroke-width', 2);

            // Draw a circle for each data point
            chart.selectAll('circle')
                .data(data)
                .enter().append('circle')
                    .attr('r', this.circleRadius)
                    .attr('cx', xAccessor)
                    .attr('cy', yAccessor)
                    .on('click', _.bind(this.featureClick, this))
                    .style('fill', this.getStyle('featureFill'))
                    .attr('title', _.bind(this.getTooltip, this));

            // Style the axes
            chart.selectAll('.axis path, .axis line')
                .style('stroke', this.getStyle('scaleFeature'))
                .style('fill', 'none');

            // Attach tooltips
            this.attachTooltips('circle');

            // Set chart height
            this.height = this.gutterTop + this.yAxisHeight + this.gutterBottom;
            chartContainer.attr('height', this.height);

            return this;

        }

    });

    return LineChartView;

});
