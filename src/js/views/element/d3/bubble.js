define(['./chart', 'underscore', 'd3'], function(ChartView, _, d3) {
    'use strict';

    var BubbleChartView = ChartView.extend({

        scaleMarginX: 5,
        scaleMarginY: 10,

        render: function() {

            // Setup chart
            ChartView.prototype.render.apply(this, arguments);

            // Get observations
            var values = this.model.getObservations();
            if (values.length < 1) {
                return this;
            }

            // Add chart
            var chart = d3.select(this.chartContainerEl).append('svg')
                .attr('width', this.width)
                .attr('class', 'bubbleChart')
                .classed('inactive', _.bind(this.model.isCut, this.model));

            // Layout observations as bubbles
            var nodes = d3.layout.pack()
                .children(function(d) {
                    return d;
                })
                .value(function(d) {
                    return d.total;
                })
                .sort(null)
                .size([this.width, this.width])
                .nodes(values)
                .filter(function (d) {
                    return (!_.isUndefined(d.id));
                });

            // Add bubbles
            var bubbles = chart.append('g')
                .selectAll('g.node')
                    .data(nodes)
                .enter().append('svg:g')
                    .attr('class', 'node')
                    .attr('title', _.bind(this.getTooltip, this))
                    .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
                    .on('click', _.bind(this.featureClick, this));

            bubbles.append('circle')
                .attr('r', function(d) { return d.r; })
                .style('fill', this.getStyle('featureFill'))
                .style('stroke', this.getStyle('featureStroke'));

            bubbles.append('text')
                .attr('class', 'chartLabel')
                .attr('text-anchor', 'middle')
                .attr('dy', '.3em')
                .style('fill', this.getStyle('label'))
                .text(_.bind(this.getLabel, this));

            // Attach tooltips
            this.attachTooltips('g');

            // Get chart height
            var chartHeight = d3.max(nodes, function(d) { return d.y + d.r; });

            // Get scale (map input domain to output range)
            this.scale = d3.scale.linear()
                .domain([
                    d3.min(nodes, this.getMeasure),
                    d3.max(nodes, this.getMeasure)
                ])
                .range([
                    d3.min(nodes, this.getArea),
                    d3.max(nodes, this.getArea)
                ]);

            // Calculate scale bubbles
            var scaleBubbles, scaleWidth, i = 5;
            do {

                // Get scale "ticks" (the scale bubbles), filtering out values of 0
                scaleBubbles = _.filter(this.scale.ticks(i));

                // Caculate scale width
                scaleWidth = _.reduce(scaleBubbles, this.getScaleWidth, 0, this);

            } while(--i > 0 && scaleWidth > this.width);

            // Set scale item positions for the getScalePosition() method
            this.scalePosX = (this.width - scaleWidth) / 2;
            this.scalePosY = this.scaleMarginY + this.getRadius(scaleBubbles[scaleBubbles.length-1]);

            // Add scale
            var scaleItems = chart.append('g')
                    .attr('transform', 'translate(0,' + chartHeight + ')')
                .selectAll('.scaleItem')
                    .data(scaleBubbles)
                .enter().append('g')
                    .attr('transform', _.bind(this.getScalePosition, this));

            // Add scale bubbles
            scaleItems.append('circle')
                    .attr('class', 'scaleBubble')
                    .style('fill', 'transparent')
                    .style('stroke', this.getStyle('scaleFeature'))
                    .attr('r', _.bind(this.getRadius, this));

            // Add scale bubble labels
            scaleItems.append('text')
                    .attr('class', 'scaleLabel')
                    .attr('text-anchor', 'middle')
                    .attr('y', this.scalePosY + this.scaleMarginY)
                    .style('fill', this.getStyle('scaleLabel'))
                    .text(this.numFormatScale);

            // Set element height to chart height + scale height
            chart.attr('height', chartHeight + (this.scalePosY * 2) + (this.scaleMarginY * 2));

            // Update container size
            this.updateSize();

            return this;

        },

        /**
         * Get a bubble's label
         */
        getLabel: function(d, i) {
            // Get this bubble's value's model
            var value = this.model.getObservation(i),
                valueLabel = this.model.getLabel(value);
            if (!valueLabel) {
                return;
            }

            // If there's a short label, use it
            var label = (_.isUndefined(valueLabel.short_label)) ? valueLabel.label : valueLabel.short_label;

            // Ignore labels that are longer than the diameter of the bubble
            if (this.getStringWidth(label) > (d.r * 2)) {
                return;
            }

            return label;
        },

        /**
         * Get bubble area from radius
         * a = πr²
         */
        getArea: function(d) {
            return Math.PI * Math.pow(d.r, 2);
        },

        /**
         * Get bubble radius from observation value
         * r = √a/π
         */
        getRadius: function(total) {
            return Math.sqrt(this.scale(total) / Math.PI);
        },

        /**
         * Get the width of a scale "tick" (bubble)
         */
        getScaleWidth: function(memo, tick) {
            return memo + (this.getRadius(tick) * 2) + this.scaleMarginX;
        },

        /**
         * Get a scale bubble's position and increment the X position for the next bubble
         */
        getScalePosition: function(total, i) {
            var radius = this.getRadius(total),
                x = this.scalePosX + radius;
            this.scalePosX += (radius * 2) + this.scaleMarginX;
            return 'translate(' + x + ',' + this.scalePosY + ')';
        }

    });

    return BubbleChartView;

});
