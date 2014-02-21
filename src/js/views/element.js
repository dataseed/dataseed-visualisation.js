define(['backbone', 'underscore', './element/summary', './element/navigation', './element/d3/bar', './element/d3/bubble', './element/d3/geo', './element/d3/table', './element/d3/line',
    './loadScreen' ,'bootstrap_dropdown'],
        function(Backbone, _, SummaryElementView, NavigationElementView, BarChartView, BubbleChartView, GeoChartView, TableChartView, LineChartView, LoadScreenView) {

    'use strict';

    var ElementView = Backbone.View.extend({

        tagName: 'article',

        elementTypes: {
            'summary':      SummaryElementView,
            'navigation':   NavigationElementView,
            'bar':          BarChartView,
            'bubble':       BubbleChartView,
            'geo':          GeoChartView,
            'table':        TableChartView,
            'line':         LineChartView
        },

        element: false,

        initialize: function(options) {
            //Create a new loadScreenView
            this.loadingView = new LoadScreenView();
            this.visualisation = options['visualisation'];
        },

        render: function() {
            // Remove existing element view
            if (this.element) {
                this.element.remove();
            }

            // Check if this element should be displayed
            if (!this.model.get('display')) {
                this.$el.addClass('hide');
                return this;
            }

            // Set element width and type
            var type = this.model.get('type');
            this.$el.removeClass()
                .addClass('element')
                .addClass('span' + (this.model.get('width') * 3))
                .addClass(type + 'Element');

            if(type !== 'summary' && type !== 'navigation') {
                this.$el.append(this.loadingView.$el);
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
