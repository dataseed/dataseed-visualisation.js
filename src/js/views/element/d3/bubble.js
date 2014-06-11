define(['./chart', 'underscore', 'd3', '../../../lib/format'],
    function(ChartView, _, d3, format) {
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
                .classed('inactive', _.bind(this.model.isCut, this.model)),

            // Layout observations as bubbles
                nodes = d3.layout.pack()
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
                    }),

            // Add bubbles
                bubbles = chart.append('g')
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

            // Set height
            this.height = Math.floor(d3.max(nodes, function(d) { return d.y + d.r; }));
            chart.attr('height', this.height);

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
