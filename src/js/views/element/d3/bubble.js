define(['./chart', 'underscore', 'd3'], function(ChartView, _, d3) {
    'use strict';

    var BubbleChartView = ChartView.extend({

        scaleGutterLeft: 5,
        scaleGutterTop: 10,

        scaleTicks: 5,
        scaleMargin: 10,

        scaleRadius: 0,

        numberOfBubbles: 0,

        render: function() {
            // Setup chart
            ChartView.prototype.render.apply(this, arguments);

            var values = this.model.getObservations();
            if (values.length < 1) {
                return this;
            }

            var format = d3.format(',d');

            var bubble = d3.layout.pack()
                .children(function(d) {
                    return d;
                })
                .value(function(d) {
                    return d.total;
                })
                .sort(null)
                .size([this.width, this.width]);

            var chart = d3.select(this.chartContainerEl).append('svg')
                .attr('width', this.width)
                .attr('class', 'bubbleChart')
                .classed('inactive', _.bind(this.model.isCut, this.model));

            var vis = chart.append('g');

            var nodes = bubble.nodes(values)
                .filter(function (d) {
                    return (!_.isUndefined(d.id));
                });

            // Add bubbles
            var node = vis.selectAll('g.node')
                    .data(nodes)
                .enter().append('svg:g')
                    .attr('class', 'node')
                    .attr('title', _.bind(this.getTooltip, this))
                    .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
                    .on('click', _.bind(this.featureClick, this));

            node.append('circle')
                .attr('r', function(d) { return d.r; })
                .style('fill', this.getStyle('featureFill'))
                .style('stroke', this.getStyle('featureStroke'));

            node.append('text')
                .attr('class', 'chartLabel')
                .attr('text-anchor', 'middle')
                .attr('dy', '.3em')
                .style('fill', this.getStyle('label'))
                .text(_.bind(this.getLabel, this));

            // Attach tooltips
            this.attachTooltips('g');

            // Add scale
            var chartHeight = d3.max(nodes, function(d) { return d.y + d.r; });

            var chartScale = chart.append('g')
                .attr('transform', 'translate(0,' + chartHeight + ')');

            // Add dividing line
            chartScale.append('line')
                .attr('class', 'scale')
                .attr('y1', this.scaleGutterTop)
                .attr('y2', this.scaleGutterTop)
                .attr('x1', this.scaleGutterLeft)
                .attr('x2', this.width - this.scaleGutterLeft);

            // Calculate scale and "ticks" (i.e. the scale bubbles)
            this.scale = d3.scale.linear()
                .domain([
                    d3.min(nodes, this.getMeasure),
                    d3.max(nodes, this.getMeasure)
                ])
                .range([
                    d3.min(nodes, this.getSize),
                    d3.max(nodes, this.getSize)
                ]);
            var ticks = this.scale.ticks(this.scaleTicks);

            // Sets a value for the tick scale if all nodes are the same size
            if(ticks.length < 1) {
                ticks[0] = this.getMeasure(nodes[0]);
            }

            if (ticks[0] === 0) {
                ticks.shift();
            }
            // Calculate width and height of scale
            var scaleWidth;
            // Printed scale ticks
            var tickSize = [];
            // Copy of the original ticks array
            var ticksTemp = ticks.slice(0);
            for(var i = 0; i <= ticksTemp.length; i++) {
                // First iteration
                if(i === 0) {
                    tickSize.push(ticksTemp.pop());
                    tickSize.push(ticksTemp.pop());
                    scaleWidth = _.reduce(tickSize, _.bind(this.getScaleItemSize, this), 0);
                    if(scaleWidth > this.width + 20) {
                        tickSize.pop();
                    }
                }
                tickSize.push(ticksTemp.pop());
                scaleWidth = _.reduce(tickSize, _.bind(this.getScaleItemSize, this), 0);
                if(scaleWidth > this.width + 20) {
                    tickSize.pop();
                }
                //removes undefined values from the array
                tickSize = tickSize.filter(Number);
                scaleWidth = _.reduce(tickSize, _.bind(this.getScaleItemSize, this), 0);
            }

            // Get the number of bubbles in the scale
            this.numberOfBubbles = tickSize.length;

            // Reverse the scale ticks to accending order
            tickSize.reverse();

            var scaleHeight = this.scaleGutterTop + (this.scale(ticks[ticks.length-1]) * 2);

            this.scalePosY = (scaleHeight / 2) + (this.scaleGutterTop * 2);
            this.scalePosX = (this.width - scaleWidth) / 2;

            // Add scale bubble containers
            var scaleItems = chartScale.selectAll('.scaleItem')
                    .data(tickSize)
                .enter().append('g')
                    .attr('transform', _.bind(this.getScalePosition, this));

            // Add scale bubbles
            scaleItems.append('circle')
                .attr('class', 'scaleBubble')
                .style('stroke', this.getStyle('scaleFeature'))
                .style('fill', 'transparent')
                .attr('r', this.scale);

            // Add scale bubbles' labels
            scaleItems.append('text')
                .attr('class', 'scaleLabel')
                .attr('text-anchor', 'middle')
                .attr('y', (scaleHeight / 2) + this.scaleMargin)
                .style('fill', this.getStyle('scaleLabel'))
                .text(this.numFormatScale);

            // Add measure text
            chartScale.append('text')
                .attr('text-anchor', 'middle')
                .attr('x', (this.width - (this.scaleGutterLeft * 2)) / 2)
                .attr('y', scaleHeight + (this.scaleMargin * 5))
                .style('fill', this.getStyle('measureLabel'))
                .text(this.model.getMeasureLabel());

            // Set chart height
            chart.attr('height', chartHeight + scaleHeight + (this.scaleGutterTop * 6));

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
         * Get size
         */
        getSize: function(d) {
            return d.r;
        },

        /**
         * Get a scale bubble's size
         */
        getScaleItemSize: function(memo, radius) {
            return memo + (this.scale(radius) * 2) + (this.scaleMargin * 2);
        },

        /**
         * Get a scale bubble's position
         */
        getScalePosition: function(d, i) {
            // Calculate scale bubble's radius
            var radius = this.scale(d);
            // Second scale bubbles
            if (i > 0) {
                this.scalePosX += radius + this.scaleRadius + 5;
            // first scale bubbles
            } else {
                if(this.numberOfBubbles > 2) {
                    this.scalePosX += radius + 30;
                } else {
                    this.scalePosX += radius + 10;
                }
            }
            // Storing the radius of the previous scale bubble
            this.scaleRadius = radius;

            // Move scale bubble/label to correct position
            return 'translate(' + this.scalePosX + ',' + this.scalePosY + ')';
        }

    });

    return BubbleChartView;

});
