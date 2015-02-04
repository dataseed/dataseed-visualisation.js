define(['backbone', 'underscore', 'jquery', './element/summary', './element/filter/navigation', './element/table', './element/d3/dc/bar', './element/d3/bubble', './element/d3/geo', './element/d3/dc/line', './loadScreen', 'bootstrap_dropdown'],
    function(Backbone, _, $, SummaryElementView, NavigationElementView, TableChartView, BarChartView, BubbleChartView, GeoChartView, LineChartView, LoadScreenView) {
    'use strict';

    var ElementView = Backbone.View.extend({

        tagName: 'article',

        events: {
            'click .remove-filter': 'reset'
        },

        chartTypes: {
            // HTML elements
            summary:      SummaryElementView,
            navigation:   NavigationElementView,
            table:        TableChartView,

            // D3/Highcharts elements
            bar:          BarChartView,
            bubble:       BubbleChartView,
            geo:          GeoChartView,
            line:         LineChartView
        },

        // Add bottom margin to element container
        marginBottom: 30,

        // Only set the element size once
        _sized: false,

        initialize: function(options) {
            this.visualisation = options.visualisation;
        },

        render: function() {
            // Get element type
            var type = this.model.get('type');

            // Set element width and type
            this.$el.removeClass()
                .addClass('element')
                .addClass('col-sm-' + (this.model.get('width') * 3))
                .addClass(type + 'Element');

            // Check if this element's data is loaded
            if (this.model.isLoaded()) {

                // Check if a chart view exists and is of the correct type
                if (!(this.chart && this.chart instanceof this.chartTypes[type])) {

                    // Remove existing chart view, if it exists
                    if (this.chart) {
                        this.chart.remove();
                    }

                    // Create new chart view
                    this.chart = new this.chartTypes[type] ({
                        parent: this.$el,
                        model: this.model,
                        visualisation: this.visualisation
                    });

                    // Add chart
                    this.$el.append(this.chart.$el);

                }

                // Render chart
                this.chart.render();

                // Show reset button when the chart is cut
                if (this.model.isCut()) {
                    this.$('.remove-filter')
                        .tipsy({gravity: 's'})
                        .children('.container-icon')
                            .show();
                } else {
                    this.$('.remove-filter')
                        .children('.container-icon')
                            .hide();
                }

                // Set element height if the chart has one and this is the first render
                if (!this._sized && (this.chart.height || this.chart.chartHeight)) {
                    var titleHeight = this.$('h2').outerHeight(),
                        chartHeight = this.chart.height || this.chart.chartHeight,
                        marginBottom = this.chart.margins ? this.chart.margins.bottom : this.marginBottom;

                    // Ensure chart height is no larger than the maximum allowed
                    if (this.chart.maxHeight) {
                        chartHeight = Math.min(chartHeight, this.chart.maxHeight);
                    }

                    // Set element height
                    this.$el.height(titleHeight + chartHeight + marginBottom);

                    // Don't set height again
                    this._sized = true;
                }

            }

            return this;
        },

        /**
         * Set the this._sized flag to false so that any following call to
         * this.render() will make the element be resized.
         */
        needResize: function(){
            this._sized = false;
        },

        /**
         * Resize the element
         */
        resize: function() {
            this.needResize();
            this.render();
        },

        /**
         * Reset chart filters button event handler
         */
        reset: function(e) {
            e.preventDefault();
            this.model.removeCut();
            $('.tipsy').remove();
        }

    });

    return ElementView;

});
