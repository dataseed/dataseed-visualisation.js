define(['./chart', 'underscore', 'd3'],
    function(ChartView, _, d3) {
    'use strict';

    var BarChartView = ChartView.extend({

        barHeight: 20,

        gutterLeft: 15,
        gutterBottom: 20,

        textX: 5,
        textY: 5,

        scaleTicks: 4,
        scaleHeight: 30,

        render: function() {

            // Setup chart
            ChartView.prototype.render.apply(this, arguments);

            // Calculate bar widths and heights
            this.barWidth = this.width - (this.gutterLeft * 2);
            var data = _.map(this.model.getObservations(), function (d) { return d.total; });
            if (data.length < 1) {
                return this;
            }

            var height = this.barHeight * data.length;

            this.scale = d3.scale.linear()
                .domain([0, d3.max(data)])
                .range([0, this.barWidth]);

            // Create bar chart
            var chart = d3.select(this.chartContainerEl)
                .append('svg')
                    .attr('width', this.barWidth + this.gutterLeft)
                    .attr('height', height + this.scaleHeight + this.gutterBottom)
                    .attr('class', 'barChart')
                    .classed('inactive', _.bind(this.model.isCut, this.model))
                    .append('g')
                        .attr('transform', 'translate(' + this.gutterLeft + ',0)');

            // Create nodes to hold bars and labels
            var nodes = chart.selectAll('g')
                    .data(data)
                .enter().append('g')
                    .attr('title', _.bind(this.getTooltip, this))
                    .attr('transform', _.bind(this.getBarPosition, this))
                    .attr('width', this.scale)
                    .attr('height', this.barHeight)
                    .on('click', _.bind(this.featureClick, this));

            // Create bars
            nodes.append('rect')
                    .attr('width', this.scale)
                    .attr('height', this.barHeight)
                    .style('fill', this.getStyle('featureFill'))
                    .style('stroke', this.getStyle('featureStroke'));

            // Create bar labels
            nodes.append('text')
                    .attr('class', 'chartLabel')
                    .attr('x', this.textX)
                    .attr('y', (this.barHeight / 2) + this.textY)
                    .style('fill', this.getStyle('label'))
                    .text(_.bind(this.getLabel, this));

            // Attach tooltips
            this.attachTooltips('g');

            // Create bar scale
            var scaleTicks = this.scale.ticks(this.scaleTicks);

            chart.selectAll('.scale')
                    .data(scaleTicks)
                .enter().append('line')
                    .attr('class', 'scale')
                    .attr('x1', this.scale)
                    .attr('x2', this.scale)
                    .attr('y1', height + 5)
                    .attr('y2', height + 10)
                    .style('stroke', this.getStyle('scaleFeature'));

            chart.selectAll('.scaleLabel')
                    .data(scaleTicks)
                .enter().append('text')
                    .attr('class', 'scaleLabel')
                    .attr('x', this.scale)
                    .attr('y', height + this.scaleHeight)
                    .attr('dy', -5)
                    .attr('text-anchor', 'middle')
                    .style('fill', this.getStyle('scaleLabel'))
                    .text(this.numFormatScale);

            chart.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', (this.width - (this.gutterLeft * 2)) / 2)
                    .attr('y', height + this.scaleHeight + this.gutterBottom)
                    .attr('dy', -5)
                    .style('fill', this.getStyle('measureLabel'))
                    .text(this.model.getMeasureLabel());

            // Update container size
            this.updateSize();

            return this;

        },

        /**
         * Get a bar group's position
         */
        getBarPosition: function (d, i) {
            return 'translate(0, ' + (i * this.barHeight) + ')';
        },

        /**
         * Get a bar's label
         */
        getLabel: function(d, i) {
            // Get this bubble's value's model
            var value = this.model.getObservation(i),
                valueLabel = this.model.getLabel(value);

            if (_.isUndefined(valueLabel)) {
                return;
            }

            // If there's a short label, use it
            var label = (_.isUndefined(valueLabel.short_label)) ? valueLabel.label : valueLabel.short_label;

            // Ignore labels that are longer than the width of the bar
            if (this.getStringWidth(label) > this.scale(d)) {
                return;
            }

            return label;
        }

    });

    return BarChartView;

});
