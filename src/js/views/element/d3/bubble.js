define(['./chart', 'underscore', 'd3', '../../../lib/format'],
    function(ChartView, _, d3, format) {
    'use strict';

    var BubbleChartView = ChartView.extend({

        scaleMarginX: 10,
        scaleMarginY: 20,
        scaleLineHeight: 10,

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
            var scaleLines, scaleWidth, i = 5;
            do {

                // Get scale "ticks" (the scale bubbles), filtering out values of 0
                scaleLines = _.filter(this.scale.ticks(i));

                // Caculate scale width
                scaleWidth = _.reduce(scaleLines, this.getScaleWidth, 0, this);

            } while(--i > 0 && scaleWidth > this.width);

            // Set scale X position for the getScalePosition() method
            this.scalePosX = (this.width - scaleWidth) / 2;

            // Get chart height
            this.height = Math.floor(d3.max(nodes, function(d) { return d.y + d.r; }));

            // Add scale
            var scaleItems = chart.append('g')
                    .attr('transform', 'translate(0,' + this.height + ')')
                .selectAll('.scaleItem')
                    .data(scaleLines)
                .enter().append('g')
                    .attr('transform', _.bind(this.getScalePosition, this));

            // Add scale lines
            scaleItems.append('polyline')
                    .attr('class', 'scaleLine')
                    .style('fill', 'none')
                    .style('stroke', this.getStyle('scaleFeature'))
                    .attr('points', _.bind(this.getScaleLine, this));

            // Add scale labels
            scaleItems.append('text')
                    .attr('class', 'scaleLabel')
                    .attr('text-anchor', 'middle')
                    .attr('y', this.scaleMarginY)
                    .attr('x', _.bind(this.getRadius, this))
                    .style('fill', this.getStyle('scaleLabel'))
                    .text(format.numScale);

            // Set chart height
            this.height += (this.scaleMarginY * 2) + this.scaleLineHeight;
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
         * Get the width of a scale "tick"
         */
        getScaleWidth: function(memo, tick) {
            return memo + (this.getRadius(tick) * 2) + this.scaleMarginX;
        },

        /**
         * Get a scale line's position and increment the X position for the next line
         */
        getScalePosition: function(total, i) {
            var x = this.scalePosX;
            this.scalePosX += (this.getRadius(total) * 2) + this.scaleMarginX;
            return 'translate(' + x + ',' + this.scaleMarginY + ')';
        },

        /**
         * Get a scale line's coordinates
         */
        getScaleLine: function(total, i) {
            var w = this.getRadius(total) * 2,
                h = this.scaleLineHeight;
            return '0,0 0,' + h + ' 0,' + (h/2) + ' ' + w + ',' + (h/2) + ' ' + w + ',0 ' + w + ',' + h;
        }

    });

    return BubbleChartView;

});
