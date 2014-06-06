define(['backbone', 'underscore', './element/summary', './element/filter/navigation', './element/filter/filterForm', './element/table', './element/d3/bar', './element/d3/bubble', './element/d3/geo', './element/d3/line', './loadScreen', 'bootstrap_dropdown'],
    function(Backbone, _, SummaryElementView, NavigationElementView, FilterFormElementView, TableChartView, BarChartView, BubbleChartView, GeoChartView, LineChartView, LoadScreenView) {
    'use strict';

    var ElementView = Backbone.View.extend({

        tagName: 'article',

        elementTypes: {
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

        element: false,

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
                    if (!(this.element && this.element instanceof this.elementTypes[type])) {

                        // Remove existing element view, if it exists
                        if (this.element) {
                            this.element.remove();
                        }

                        // Create new element view
                        this.element = new this.elementTypes[type] ({
                            parent: this.$el,
                            model: this.model,
                            visualisation: this.visualisation
                        });

                        // Add element
                        this.$el.append(this.element.$el);

                    }

                    // Render
                    this.element.render();

                }

            }

            return this;
        }

    });

    return ElementView;

});
