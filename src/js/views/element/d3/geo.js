define(['./chart', 'underscore', 'd3', '../../../lib/format'],
    function(ChartView, _, d3, format) {
    'use strict';

    var GeoChartView = ChartView.extend({

        scalingFactorX: 150,
        scalingFactorY: 10,

        scaleTicks: 7,

        scaleGutterLeft: 10,
        scaleGutterTop: -60,

        scaleItemWidth: 30,
        scaleItemHeight: 15,

        scaleItemMarginLeft: 0,
        scaleItemMarginTop: 10,

        scaleMeasureHeight: 25,

        render: function() {

            // Setup chart
            ChartView.prototype.render.apply(this, arguments);

            // Get current values
            var values = this.model.getObservations();

            // Get polygons (in the form of GeoJSON features) for all data points
            var data = _.map(values, _.bind(this.getBoundary, this));

            // Get bounds enclosing all polygons
            var bounds = d3.geo.bounds(this.createFeature(
                'MultiPolygon',
                _.reduce(data, this.concatCoords, [])
            ));

            var mapWidth = Math.abs(bounds[1][0] - bounds[0][0]);
            var mapHeight = Math.abs(bounds[1][1] - bounds[0][1]);

            var scale = (this.width / mapWidth) * this.scalingFactorX;
            this.height = (this.width / mapHeight) * this.scalingFactorY;

            // Set map projection
            var projection = d3.geo.stereographic()
                .translate([this.width / 2, this.height / 2])
                .scale(scale);

            // Set geo path generator using our projection
            var path = d3.geo.path()
                .projection(projection);

            // Calculate centre point of map from bounding box
            var centroid = path.centroid(this.createFeature(
                'Polygon',
                [[
                    [bounds[0][0], bounds[0][1]], // left, top
                    [bounds[0][0], bounds[1][1]], // left, bottom
                    [bounds[1][0], bounds[1][1]], // right, bottom
                    [bounds[1][0], bounds[0][1]], // right, top
                    [bounds[0][0], bounds[0][1]] // left, top
                ]]
            ));

            // Convert centroid from pixel coordinates to lat/lon
            centroid = projection.invert(centroid);

            // Set the centre point for our projection and update path generator with new projection
            path = path.projection(projection.rotate([-centroid[0], 0]).center([0, centroid[1]]));

            // Attach map SVG
            var chart = d3.select(this.chartContainerEl)
                .append('svg:svg')
                .attr('height', this.height)
                .attr('class', 'geoChart')
                .classed('inactive', _.bind(this.model.isCut, this.model));

            var geo = chart.append('svg:g');

            // Get colour range for the current set of values
            this.colourScale = d3.scale.linear()
                .domain([
                    d3.min(values, this.getMeasure),
                    d3.max(values, this.getMeasure)
                ])
                .range([this.model.visualisation.styles.getStyle('choroplethMin'), this.model.visualisation.styles.getStyle('choroplethMax')]);

            // Build choropleth
            var features = geo.selectAll('path')
                .data(data)
            .enter().append('svg:path')
                .attr('d', path)
                .style('fill', _.bind(this.featureFill, this))
                .attr('title', _.bind(this.getTooltip, this))
                .on('click', _.bind(this.featureClick, this));

            // Attach tooltips
            this.attachTooltips('path');

            // Create scale
            var chartScale = chart.append('svg:g')
                .attr('transform', 'translate(' + this.scaleGutterLeft + ',' + (this.height + this.scaleGutterTop) + ')');

            var scaleTicks = this.colourScale.ticks(this.scaleTicks);

            chartScale.selectAll('.scale')
                    .data(scaleTicks)
                .enter().append('rect')
                    .attr('class', 'scale')
                    .attr('x', _.bind(this.getScaleItemX, this))
                    .attr('y', this.scaleItemMarginTop)
                    .attr('width', this.scaleItemWidth)
                    .attr('height', this.scaleItemHeight)
                    .attr('fill', this.colourScale);

            chartScale.selectAll('.scaleLabel')
                    .data(scaleTicks)
                .enter().append('text')
                    .attr('class', 'scaleLabel')
                    .attr('x', _.bind(this.getScaleItemX, this))
                    .attr('y', (this.scaleItemMarginTop * 2) + this.scaleItemHeight)
                    .style('fill', this.getStyle('scaleLabel'))
                    .text(format.numScale);

            chartScale.append('text')
                    .attr('class', 'scaleLabel')
                    .attr('text-anchor', 'middle')
                    .attr('x', (this.width - (this.scaleGutterLeft * 2)) / 2)
                    .attr('y', (this.scaleItemMarginTop * 2) + this.scaleItemHeight + this.scaleMeasureHeight)
                    .attr('dy', -5)
                    .style('fill', this.getStyle('scaleFeature'))
                    .text(this.model.getMeasureLabel());

            // Update container size
            this.updateSize();

            return this;

        },

        /**
         * Overriden: Reset all chart features
         */
        resetFeatures: function() {
            d3.select(this.chartContainerEl)
                .select('svg')
                    .selectAll('g path')
                        .style('fill', _.bind(this.featureFill, this));
        },

        /**
         * Get boundary GeoJSON data
         */
        getBoundary: function (d) {
            var modelData = this.model.getLabels();
            if (d.id in modelData) {
                return modelData[d.id].area;
            }
            return;
        },

        /**
         * Concatenate the coordinates of multiple GeoJSON features
         */
        concatCoords: function(coords, d) {
            try {
                coords = coords.concat(d.geometry.coordinates);
            } catch (e) { }
            return coords;
        },

        /**
         * Helper function to create a GeoJSON feature
         */
        createFeature: function(type, coords) {
            return {
                'type': 'Feature',
                'geometry': {
                    'type': type,
                    'coordinates': coords
                }
            };
        },

        /**
         * Set colour of geo chart feature
         */
        featureFill: function(d, i) {
            if (this.model.hasCutValue(i)) {
                return this.model.visualisation.styles.getStyle('featureFill');
            }
            return this.colourScale(this.model.getObservation(i).total);
        },

        /**
         * Set X position of scale item
         */
        getScaleItemX: function(d, i) {
            return i * (this.scaleItemWidth + this.scaleItemMarginLeft);
        }

    });

    return GeoChartView;

});
