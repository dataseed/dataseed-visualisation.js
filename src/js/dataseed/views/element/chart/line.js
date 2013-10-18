define(['../chart', 'underscore', 'd3'],
    function (ChartView, _, d3) {
        'use strict';

        var LineChartView = ChartView.extend({
            gutterLeft: 50,
            gutterBottom: 50,
            gutterTop: 10,
            labelY: 35,

            // these two values are used in the height calculation
            heightWeight: 100,
            heightMin: 120,

            circleRadius: 3,

            render: function () {
                // Setup chart: call the "super" render implementation
                ChartView.prototype.render.apply(this, arguments);

                var that = this;

                var data = _.map(this.model.getObservations(), function (d, i) {
                    return {
                        'label': that.getLabel(d, i),
                        'total': d.total
                    };
                });

                // The height is calculated as (a sort of) log regression:
                // it will not be so big when we have a lot of data and not so
                // low when we have few data
                var height = this.heightMin + Math.floor(Math.log(this.heightWeight * data.length + 1));

                // Use an ordinal scale because we assume that the x domain is
                // is made of string (the observation labels for the dimension)
                var x = d3.scale.ordinal()
                    .rangePoints([0, this.width - (this.gutterLeft * 2)]);

                var y = d3.scale.linear()
                    .range([height , 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
//                    .tickSize(-height) // this draws vertical tick lines
                    .tickSubdivide(false)
                    .tickFormat(function (d) {
                        return d;
                    });

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .tickFormat(this.numFormatScale);

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

                // calculate x axis domains (discrete)
                x.domain(_.map(data, function (d, i) {
                    return d.label;
                }));

                // calculate y axis domains (continuous)
                var ydomainNumbers = d3.extent(data, function (d) {
                    return d.total;
                });

                if (ydomainNumbers[0] === ydomainNumbers[1]) {
                    // we need two different values in order to get a proper
                    // linear scale for the y axis
                    ydomainNumbers[1] = (ydomainNumbers[0] === 0) ? 10 : ydomainNumbers[0] * 10;
                }

                y.domain(ydomainNumbers);

                // Draw X axis
                var renderedXAxis = chart.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                renderedXAxis.append("text")
                    .attr("y", this.labelY)
                    .attr('text-anchor', 'middle')
                    .attr('x', (this.width - (this.gutterLeft * 2)) / 2)
                    .style('fill', this.getStyle('measureLabel'))
                    .text(this.model.getMeasureLabel() + ' by ' + this.model.attributes.label);

                // Draw Y axis
                var renderedYAxis = chart.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                // Draw the line
                var path = chart.append("path")
                    .datum(data)
                    .attr("class", "line")
                    .attr("d", line)
                    .style('fill', 'none')
                    .style('stroke', this.getStyle('featureFill'))
                    .style('stroke-width', 2);

                // Draw a circle for each data point
                chart.selectAll("dot")
                    .data(data)
                    .enter().append("circle")
                    .attr("r", this.circleRadius)
                    .attr("cx", function (d) {
                        return x(d.label);
                    })
                    .attr("cy", function (d) {
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
