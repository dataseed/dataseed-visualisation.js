define(['../chart', 'underscore', 'd3'],
    function (ChartView, _, d3) {
    'use strict';

    var LineChartView = ChartView.extend({
        gutterLeft: 50,
        gutterBottom: 80,
        gutterTop: 10,
        labelY: 65,

        // these two values are used in the height calculation
        heightWeight: 100,
        heightMin: 120,

        circleRadius: 3,

        render: function () {

            // Setup chart: call the "super" render implementation
            ChartView.prototype.render.apply(this, arguments);

            var data = _.map(this.model.getObservations(), function (d, i) {
                return {
                    'label': this.getLabel(d, i),
                    'total': d.total
                };
            }, this);

            // The height is calculated as (a sort of) log regression:
            // it will not be so big when we have a lot of data and not so
            // low when we have few data
            var height = this.heightMin + Math.floor(Math.log(this.heightWeight * data.length + 1));

            // Use an ordinal scale for dimension labels
            var x = d3.scale.ordinal()
                .domain(_.map(data, function (d, i) {
                    return d.label;
                }))
                .rangePoints([0, this.width - (this.gutterLeft * 2)]);

            // Use a linear scale
            var y = d3.scale.linear()
                .domain([0, d3.max(data, function(d) {
                    return d.total;
                })])
                .range([height, 0]);

            // Create axes objects
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient('bottom')
                .tickFormat(function (d) {
                    return d;
                });

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .ticks(5)
                .tickFormat(this.numFormatScale);

            // Create line object
            var line = d3.svg.line()
                .x(function (d) {
                    return x(d.label);
                })
                .y(function (d) {
                    return y(d.total);
                });

            // Create line chart
            var chart = d3.select(this.chartContainerEl)
                .append('svg')
                    .attr('width', this.width + this.gutterLeft)
                    .attr('height', height + this.gutterBottom)
                    .attr('class', 'lineChart')
                    .classed('inactive', _.bind(this.model.isCut, this.model))
                    .append('g')
                        .attr('transform', 'translate(' + this.gutterLeft + ',' + this.gutterTop + ')');

            // Draw X axis
            chart.append('g')
                .attr('class', 'x axis')
                // draw the x axis at the origin (zero)
                .attr('transform', 'translate(0,' + y(0) + ')')
                .call(xAxis)
                .selectAll('text')
                    .style('text-anchor', 'end')
                    .attr('transform', 'rotate(320 0,5)');

            // Draw Y axis
            chart.append('g')
                .attr('class', 'y axis')
                .call(yAxis)
                .append('text')
                    .attr('y', -this.labelY)
                    .style('text-anchor', 'end')
                    .style('fill', this.getStyle('measureLabel'))
                    .text(this.model.getMeasureLabel());

            chart.append('text')
                .attr('y', height + this.labelY)
                .attr('text-anchor', 'middle')
                .attr('x', (this.width - (this.gutterLeft * 2)) / 2)
                .style('fill', this.getStyle('measureLabel'))
                .text(this.model.attributes.label + ' by ' + this.model.getMeasureLabel());

            // Draw the line
            var path = chart.append('path')
                .datum(data)
                .attr('class', 'line')
                .attr('d', line)
                .style('fill', 'none')
                .style('stroke', this.getStyle('featureFill'))
                .style('stroke-width', 2);

            // Draw a circle for each data point
            chart.selectAll('dot')
                .data(data)
                .enter().append('circle')
                    .attr('r', this.circleRadius)
                    .attr('cx', function (d) {
                        return x(d.label);
                    })
                    .attr('cy', function (d) {
                        return y(d.total);
                    })
                    .on('click', _.bind(this.featureClick, this))
                    .style('fill', this.getStyle('featureFill'))
                    .attr('title', _.bind(this.getTooltip, this));

            // Attach tooltips
            this.attachTooltips('circle');

            //style the axis
            chart.selectAll('.axis path, .axis line')
                .style('stroke', this.getStyle('scaleFeature'))
                .style('fill', 'none');

            // Remove the load spinner when chart finished loading.
            this.stopLoading('line');

            return this;
        },

        /**
         * Get a bar's label
         */
        getLabel: function (d, i) {
            // Get this linechart's value's model
            var value = this.model.getObservation(i),
                valueLabel = this.model.getLabel(value);

            if (_.isUndefined(valueLabel)) {
                return;
            }

            // If there's a short label, use it
            var label = (_.isUndefined(valueLabel.short_label)) ? valueLabel.label : valueLabel.short_label;

            return label;
        }

    });

    return LineChartView;

});
