define(['backbone', 'underscore', 'jquery', 'd3', './../chart'],
    function(Backbone, _, $, d3, ChartView) {
    'use strict';
    /**
     * Abstract base class for DC-based chart Views
     *
     * Derived classes
     *  - should implement the following methods:
     *      - getFeatureHeight() - only if the derived class implements any method
     *        which calls this.getFeatureLabel() or this.ignoreLabel() - both
     *        inherited from ChartView
     *      - applyStyles()
     *      - updateMeasureLabel()
     *
     *  - should set the following properties:
     *      - dcChartConstructor: the dc chart constructor
     *      - tooltipSelector: the selector string to target the chart's
     *        features thetooltips should be attached to
     *      - dataFeatureSelector: the selector related to the chart's
     *        data-related features (e.g. rows for barchart, dots for
     *        linechart, etc.). Derived classes have to define it only if they
     *        use the this.resetFeatures() helper.
     *
     *  - may have to override:
     *      - getChartData() : the data format returned by this.getChartData()
     *        is suitable for almost all the DC charts but some charts may
     *        require a different one. When implementing a new DC chart,
     *        use the dc demo to check the required data format (e.g. for
     *        the line chart we could just add the following line to stock.js:
     *        console.log(moveChart.data(), 'lineChart data');
     *      - getObservationFromDCDatum() and getDCDatumFromObservation()
     *        derived classes have to override these helpers only if the
     *        related DC chart requires a specific data format (such as
     *        dc.lineChart)
     *
     *   this.render() invokes helper methods that can be overridden (or have
     *   to be actually implemented, such as applyStyles() ) by derived classes
     *   to "hook into" a particular phase of the chart rendering flow.
     *   Specifically:
     *      - this.prepareChart() is responsible of applying the settings that
     *        the DC chart requires to be drawn
     *      - this.initChart() is responsible of applying the settings that
     *        the DC chart needs only when it is rendered from scratch
     *      - this.renderChart() basically invokes this.chart.render() but it
     *        can be used to implement operations that need to be performed
     *        right after/before the chart is rendered from scratch. It is
     *        meant to be an alternative to renderlet callback implementations
     *        which sometimes are not a suitable choice as they run at the
     *        end of transitions - see notes on the call to this.applyStyles()
     *        in this.render()
     *      - this.redrawChart() same as this.renderChart() with the only
     *        difference that it is related to the chart redraw instead of
     *        the rendering from scratch
     *      - this.applyStyles() is an "abstract" helper (i.e. has to be
     *        implemented by derived classes) to set up the chart styles.
     *        Note: DC applies some style-related attributes (e.g. fill,
     *        stroke) that may have to be removed
     */

    var DcChartView = ChartView.extend({

        // Chart's margins
        margins: {top: 0, left: 10, right: 10, bottom: 50},

        /**
         * Override setFeatures()
         * we set it as a noop: features styles are set by DC thus
         * this.render() has only to handle the reset
         */
        setFeatures: $.noop,

        /**
         * Initialise chart
         */
        initialize: function(options) {
            ChartView.prototype.initialize.call(this, options);
            this.listenTo(this.model.get('settings'), 'change:measure_label', this.updateMeasureLabel);
        },

        /**
         * Override ChartView.ignoreLabel()
         */
        ignoreLabel: function(d, i, label) {
            var stringDim = this.getStringSize(label);

            // Ignore labels that are longer than the chart's width or higher
            // than the related chart's feature
            return (stringDim.width > this.chart.effectiveWidth() || stringDim.height > this.getFeatureHeight());
        },

        /**
         * Render chart
         */
        render: function() {
            if (!this.dcChartConstructor) {
                throw new Error('this.dcChartConstructor needs to be defined');
            }

            ChartView.prototype.render.apply(this, arguments);

            var data = this.getChartData(),
                needsInit = !this.chart;

            if (data.length < 1) {
                // Don't render if there's no data
                return this;
            }

            this.prepareChart(data);

            if (needsInit) {
                this.initChart();
                this.renderChart();
            }else{
                this.redrawChart();
            }

            // Apply Styles
            // Note: we can't use a DC renderlet callback because if we do so
            // the style would be applied only at the end of the transitions.
            // In other words:
            //  - the chart would get rendered (and displayed) with the default
            //    DC styles
            //  - at the end of the transitions, our own styles would be applied
            this.applyStyles();
            this.resetFeatures();

            // setup tooltips
            this.setupTooltips();

            return this;
        },

        /**
         * Helper to translate a DC datum in the Dataseed observation format
         */
        getDCDatumFromObservation: function(o) {
            return {key: o.id, value: o.total};
        },

        /**
         * Helper to translate a Dataseed Observation in the DC data format
         */
        getObservationFromDCDatum: function(d) {
            return {id: d.key, total: d.value};
        },

        /**
         * Build the chart's data.
         */
        getChartData: function() {
            return _.map(this.model.getObservations(), function (o) {
                return this.getDCDatumFromObservation(o);
            }, this);
        },

        /**
         * Apply the settings required to draw the chart
         */
        prepareChart: function(data) {
            this.chart = this.chart || this.dcChartConstructor(this.container);

            this.chart
                // Set the chart's data
                .data(_.bind(_.identity, this, data))
                .width(this.width)
                .height(this.height);
        },

        /**
         * Apply initial chart settings
         */
        initChart: function() {
            // Set initial chart height
            this.chartHeight = this.height;

            // Set chart ID
            this.$container.attr('id', this.model.get('id') || this.model.cid);

            // Override hasFilter() and filter()
            this.chart.hasFilter = _.bind(this.hasFilter, this);
            this.chart.filter = _.bind(this.filter, this);

            // Set chart margins
            this.chart
                .margins(this.margins)

                // mock dimension and group
                .dimension({filter: $.noop})
                .group({all: $.noop});
        },

        /**
         * Override DC method to check if a chart is filtered
         */
        hasFilter: function(filter) {
            return _.isUndefined(filter) ? this.model.isCut() : this.model.hasCutId(filter);
        },

        /**
         * Override DC method to apply a filter to a chart
         */
        filter: function(value) {
            this.featureClick({id: value});
        },

        /**
         * Render the DC chart from scratch
         */
        renderChart: function() {
            this.chart.render();
        },

        /**
         * Redraw the DC chart
         */
        redrawChart: function() {
            // Set chart width and height
            var svg = this.chart.svg();
            if (svg) {
                svg.attr({width: this.width, height: this.chartHeight});
            }

            // We use redraw instead of render: when re-drawing dc tries to
            // update the graphic incrementally (using transitions)
            // @see dc.redrawAll([chartGroup])
            this.chart.redraw();
        },

        /**
         * Set features titles and attach tooltips
         */
        setupTooltips: function() {
            if(!this.tooltipSelector){
                throw new Error('this.tooltipSelector needs to be defined');
            }

            if(!this.chart.svg()){
                throw new Error('setupTooltips() needs to be invoked after the chart has been rendered');
            }

            // We set the titles through d3 because, for some reason, using
            // this.chart.title() doesn't work
            this.chart.svg()
                .selectAll(this.tooltipSelector)
                .attr('title', _.compose(
                    _.bind(this.getTooltip, this),
                    _.bind(this.getObservationFromDCDatum, this)
                ));
            this.attachTooltips(this.tooltipSelector);
        },

        /**
         * Helper method to reset the axis and ticks styles
         */
        resetAxis: function() {
            // Axis (Scale)
            this.chart.svg()
                .selectAll('g.axis path')
                .style('fill', 'none')
                .style('stroke', this.getStyle('scaleFeature'));

            // Ticks
            this.chart.svg()
                .selectAll('g.tick')
                .select('line')
                .style('fill', 'none')
                .style('stroke', this.getStyle('scaleFeature'));

            // Tick labels
            this.chart.svg()
                .selectAll('g.tick text')
                .style('fill', this.getStyle('scaleFeature'));

            // Axis labels
            this.chart.svg()
                .select('text.y-axis-label, text.scaleLabel')
                .style('fill', this.getStyle('scaleFeature'));
        },

        /**
         * Helper method to reset all the chart features styles
         */
        resetFeatures: function() {
            // Set chart status
            this.chart.svg().classed('inactive', _.bind(this.model.isCut, this.model));

            // Reset chart's features: remove all the style-related attr
            // applied by DC
            this.chart.svg()
                .selectAll(this.dataFeatureSelector)
                .attr({fill: null, stroke: null})
                .style('fill', this.getStyle('featureFill'))
                .style('stroke', this.getStyle('featureStroke'));

            // Axis and ticks
            this.resetAxis();

            /*
             * If a filter (dataset cut) is set for the chart, DC assigns to
             * each data feature the class:
             *  - "selected" if the feature refers to the value the chart is
             *  filtered on
             *  - "deselected" otherwise
             *
             * The chart's features (both the "selected" ones and the ones
             * related to a non-filtered chart) are styled by setting
             * this.dataFeatureSelector (see above). Thus here we just need to
             * set the style for the features classed as "deselected"
             */
            this.chart.svg()
                .selectAll('.deselected')
                .style('fill', this.getStyle('featureFillActive'))
                .style('stroke', this.getStyle('featureStrokeActive'));
        },

        /**
         * Get style function for the specified type
         */
        getStyle: function(type) {
            /* With almost all the DC charts we don't need to use the getStyle
             * method of the styles collection because we don't need to check
             * whether a feature is "active" or not: chart's features get a
             * proper class if they are included in the current cut - see
             * this.resetFeatures()
             * Note: line charts represent one of the few exceptions for this
             * class assignment pattern.
             */
            return this.model.visualisation.styles.lookupStyle(type);
        }

    });

    return DcChartView;

});
