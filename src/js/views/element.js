define(['backbone', 'underscore', './element/summary', './element/filter/navigation', './element/filter/filterForm', './element/table', './element/d3/bar', './element/d3/bubble', './element/d3/geo', './element/d3/line', './loadScreen', 'bootstrap_dropdown'],
    function(Backbone, _, SummaryElementView, NavigationElementView, FilterFormElementView, TableChartView, BarChartView, BubbleChartView, GeoChartView, LineChartView, LoadScreenView) {
    'use strict';

    var ElementView = Backbone.View.extend({

        tagName: 'article',

        chartTypes: {
            // HTML elements
            summary:      SummaryElementView,
            navigation:   NavigationElementView,
            filterForm:   FilterFormElementView,
            table:        TableChartView,

            // D3/Highcharts elements
            bar:          BarChartView,
            bubble:       BubbleChartView,
            geo:          GeoChartView,
            line:         LineChartView
        },

        events: {
            'click .remove-filter': 'reset'
        },

        // Add bottom margin to element container
        marginBottom: 60,

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
                .addClass('span' + (this.model.get('width') * 3))
                .addClass(type + 'Element');

            // Check if this element should be displayed
            if (this.model.get('display') !== true) {
                this.$el.addClass('hide');

            } else {
                // Ensure model has been initialised if this element has been
                // shown after initially being hidden
                this.model.initConnections();

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
                        this.$('.container-icon').addClass('in');
                        this.$('.remove-filter').tipsy({gravity: 's'});
                    }

                    // Set element height if the chart has one and this is the first render
                    if (!this._sized && this.chart.height) {

                        // Get chart height
                        var height = this.chart.height;
                        if (this.chart.maxHeight) {
                            height = Math.min(height, this.chart.maxHeight);
                        }

                        // Set element height
                        this.$el.height(height + this.marginBottom);

                        // Don't set height again
                        this._sized = true;

                    }

                }

            }

            return this;
        },

        /**
         * Reset chart filters button event handler
         */
        reset: function(e) {
            e.preventDefault();
            this.model.removeCut();
            this.chart.resetFeatures();
            $('.tipsy').remove();
        }

    });

    return ElementView;

});
