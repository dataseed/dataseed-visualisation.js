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

        // Elements that should use the loading view
        loadingElementTypes: ['table', 'bar', 'bubble', 'geo', 'line'],

        element: false,
        loadingView: false,

        initialize: function(options) {
            this.visualisation = options['visualisation'];
        },

        render: function() {
            // Set element width and type
            this.$el.removeClass()
                .addClass('element')
                .addClass('span' + (this.model.get('width') * 3))
                .addClass(type + 'Element');

            // If the model hasn't loaded, show loading view
            var type = this.model.get('type');
            if (!this.model.isLoaded()) {
                if (_.contains(this.loadingElementTypes, type)) {
                    this.loadingView = new LoadScreenView({left: 40, top: 60});
                    this.$el.append(this.loadingView.$el);
                }
                return;
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

            // Hide loading view
            if (this.loadingView !== false) {
                this.loadingView.remove();
                this.loadingView = false;
            }

            return this;
        }

    });

    return ElementView;

});
