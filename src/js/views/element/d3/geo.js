define(['underscore', 'd3', 'topojson', '../chart', '../../../lib/format'],
    function(_, d3, topojson, ChartView, format) {
    'use strict';

    var GeoChartView = ChartView.extend({

        scaleFactor: 100,
        margin: 10,

        scaleTicks: 7,
        scaleHeight: 60,
        scaleItemHeight: 15,
        scaleMeasureHeight: 25,

        render: function() {
            // Setup chart
            ChartView.prototype.render.apply(this, arguments);
            this.$container.empty();

            // Get GeoJSON
            var values = this.model.getObservations(),
                gjson = this.getGeoJSON();
            if (!gjson) {
                return this;
            }

            // Calculate map height
            var mheight = this.height - this.scaleHeight - this.margin;
            if (mheight < 1) {
                // Don't render, if there isn't enough vertical space
                return this;
            }

            // Setup projection, bounds and scaling factor
            var center = d3.geo.centroid(gjson),
                projection = d3.geo.mercator()
                    .scale(this.scaleFactor)
                    .center(center)
                    .translate([this.width/2, mheight/2]),
                path = d3.geo.path()
                    .projection(projection),
                bounds = path.bounds(gjson),
                hscale = (this.scaleFactor * this.width)  / (bounds[1][0] - bounds[0][0]),
                vscale = (this.scaleFactor * mheight) / (bounds[1][1] - bounds[0][1]);

            // Calculate scale factor
            this.scaleFactor = (hscale < vscale) ? hscale : vscale;

            // Re-scale and re-center projection
            projection = projection
                .scale(this.scaleFactor)
                .center(center);

            // Calculate offset and translate projection
            path = path.projection(projection);
            bounds = path.bounds(gjson);
            projection = projection.translate([
                this.width - (bounds[0][0] + bounds[1][0])/2,
                mheight - (bounds[0][1] + bounds[1][1])/2
            ]);

            // Get colour range for the current set of values
            this.colourScale = d3.scale.linear()
                .domain([
                    d3.min(values, this.getMeasure),
                    d3.max(values, this.getMeasure)
                ])
                .range([
                    this.model.visualisation.styles.getStyle('choroplethMin'),
                    this.model.visualisation.styles.getStyle('choroplethMax')
                ]);

            // Add SVG
            var chart = d3.select(this.container)
                .append('svg')
                    .attr('width', this.width)
                    .attr('height', this.height)
                    .attr('class', 'geoChart')
                    .classed('inactive', _.bind(this.model.isCut, this.model));

            // Add geo container
            chart.append('g')
                    .attr('width', this.width)
                .selectAll('path')
                    .data(gjson.features)
                        .enter()
                    .append('path')
                        .attr('d', path)
                        .style('stroke', this.getStyle('choroplethStroke'))
                        .style('stroke-width', this.getStyle('choroplethStrokeWidth'))
                        .style('fill', _.bind(this.featureFill, this))
                        .attr('title', _.bind(this.getTooltip, this))
                        .on('click', _.bind(this.featureClick, this));

            // Attach tooltips
            this.attachTooltips('path');

            // Create scale
            var chartScale = chart.append('g')
                    .attr('transform', 'translate(' + this.margin + ',' + mheight + ')'),
                scaleTicks = this.colourScale.ticks(this.scaleTicks);

            this.scaleItemWidth = Math.floor((this.width - (this.margin * 2)) / scaleTicks.length);

            chartScale.selectAll('.scale')
                    .data(scaleTicks)
                .enter().append('rect')
                    .attr('class', 'scale')
                    .attr('x', _.bind(this.getScaleItemX, this))
                    .attr('y', this.margin)
                    .attr('width', this.scaleItemWidth)
                    .attr('height', this.scaleItemHeight)
                    .attr('fill', this.colourScale);

            chartScale.selectAll('.scaleLabel')
                    .data(scaleTicks)
                .enter().append('text')
                    .attr('class', 'scaleLabel')
                    .attr('x', _.bind(this.getScaleItemX, this))
                    .attr('y', (this.margin * 2) + this.scaleItemHeight)
                    .style('fill', this.getStyle('scaleLabel'))
                    .text(format.numScale);

            chartScale.append('text')
                    .attr('class', 'scaleLabel')
                    .attr('text-anchor', 'middle')
                    .attr('x', (this.width - (this.margin * 2)) / 2)
                    .attr('y', (this.margin * 2) + this.scaleItemHeight + this.scaleMeasureHeight)
                    .attr('dy', -5)
                    .style('fill', this.getStyle('scaleFeature'))
                    .text(this.model.getMeasureLabel());

            return this;

        },

        /**
         * Transform TopoJSON into GeoJSON and cache
         */
        getGeoJSON: function() {
            if (!this.gjson) {
                var tjson = this.model.getDimensionData('geo');
                if (!tjson) {
                    return null;
                }
                this.gjson = topojson.feature(tjson, tjson.objects.data);
            }
            return this.gjson;
        },

        /**
         * Overriden: Reset all chart features
         */
        setFeatures: function() {
            d3.select(this.container)
                .select('svg')
                    .selectAll('g path')
                        .style('fill', _.bind(this.featureFill, this));
        },

        /**
         * Set colour of geo chart feature
         */
        featureFill: function(d, i) {
            if (this.model.hasCutId(d.id)) {
                return this.model.visualisation.styles.getStyle('featureFill');
            }
            var value = this.model.getObservationById(d.id);
            if (value) {
                return this.colourScale(value.total);
            }
            return this.model.visualisation.styles.getStyle('choroplethMin');
        },

        /**
         * Set X position of scale item
         */
        getScaleItemX: function(d, i) {
            return i * this.scaleItemWidth;
        }

    });

    return GeoChartView;

});
