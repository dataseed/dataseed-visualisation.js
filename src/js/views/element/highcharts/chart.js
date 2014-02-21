define(['backbone', 'underscore', 'text!../../../templates/element/chart.html'], function(Backbone, _, chartTemplate) {
    'use strict';

    var ChartView = Backbone.View.extend({

        template: _.template(chartTemplate),

        initialize: function(options) {
            // Get parent element
            this.$parent = options['parent'];
        },

        /**
         * Default render functionality
         */
        render: function() {
            // Render template
            this.$el.html(this.template(this.model.attributes));

            // Set custom colours
            this.$el.css('background-color', this.model.visualisation.styles.getStyle('background'));
            this.$('h2').css('color', this.model.visualisation.styles.getStyle('heading'));

            // Get parent element size
            this.width = this.$parent.width();
            this.height = this.$parent.height();

            // Kepp reference to container element for highcharts
            this.chartContainer = this.$('.chart-container');

            return this;
        },

        stopLoading: function(chart) {
            $('.' + chart + 'Element .spinner').remove();
        }

    });

    return ChartView;

});
