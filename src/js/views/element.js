define(['backbone', 'underscore', 'jquery', './element/summary', './element/filter/navigation', './element/table', './element/dc/bar', './element/dc/line', './element/d3/bubble', './element/d3/geo', './loadScreen', 'bootstrap_dropdown'],
    function(Backbone, _, $, SummaryElementView, NavigationElementView, TableChartView, BarChartView, LineChartView, BubbleChartView, GeoChartView, LoadScreenView) {
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

            // D3/DC elements
            bar:          BarChartView,
            bubble:       BubbleChartView,
            geo:          GeoChartView,
            line:         LineChartView
        },

        initialize: function(options) {
            this.visualisation = options.visualisation;

            // Listen for changes in chart size and re-render
            this.listenTo(this.model, 'change:width change:height', this.render);
        },

        render: function() {
            // Get element type
            var type = this.model.get('type');

            this.$el
                // Set element ID
                .attr('id', this.model.get('id'))

                // Remove existing element type class (if any) and
                .attr('class', function(idx, classes) {
                    if (classes) {
                        return classes.replace(/(^|\s)\w+Element/g, '');
                    }
                })

                // Set current type
                .addClass('element ' + type + 'Element');

            // Check if this element's data is loaded
            if (this.model.isLoaded()) {

                // Check if a chart view exists and is of the correct type
                if (!(this._chart && this._chart instanceof this.chartTypes[type])) {

                    // Remove existing chart view, if it exists
                    if (this._chart) {
                        this._chart.remove();
                    }

                    // Create new chart view
                    this._chart = new this.chartTypes[type] ({
                        model: this.model,
                        visualisation: this.visualisation
                    });

                    // Add chart
                    this.$el.append(this._chart.$el);

                }

                // Render chart
                this._chart.render();

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

            }

            return this;
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
