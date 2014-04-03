define(['backbone', 'underscore', './element/summary', './element/filter/navigation', './element/filter/filterForm', './element/table', './element/d3/bar', './element/d3/bubble', './element/d3/geo', './element/d3/line', './loadScreen', 'bootstrap_dropdown'],
    function(Backbone, _, SummaryElementView, NavigationElementView, FilterFormElementView, TableChartView, BarChartView, BubbleChartView, GeoChartView, LineChartView, LoadScreenView) {
    'use strict';

    var ElementView = Backbone.View.extend({

        tagName: 'article',

        elementTypes: {
            // HTML elements
            'summary':      SummaryElementView,
            'navigation':   NavigationElementView,
            'filterForm':   FilterFormElementView,
            'table':        TableChartView,

            // D3/Highcharts elements
            'bar':          BarChartView,
            'bubble':       BubbleChartView,
            'geo':          GeoChartView,
            'line':         LineChartView
        },

        element: false,

        initialize: function(options) {
            this.visualisation = options['visualisation'];
        },

        render: function() {
            var type = this.model.get('type');

            // Set element width and type
            this.$el.removeClass()
                .addClass('element')
                .addClass('span' + (this.model.get('width') * 3))
                .addClass(type + 'Element');

            if (!this.model.isLoaded()) {
                return this;
            }

            // Remove existing element view
            if (this.element) {
                this.element.remove();
            }

            // Check if this element should be displayed
            if (!this.model.get('display')) {
                this.$el.addClass('hide');
                return this;
            }

            // Create element view
            this.element = new this.elementTypes[type] ({
                parent: this.$el,
                model: this.model,
                visualisation: this.visualisation
            });

            // Render element
            this.$el.append(this.element.render().$el);
            return this;
        }

    });

    return ElementView;

});
