define(['backbone', 'underscore', 'text!../../../templates/element/chart.html'], function(Backbone, _, chartTemplate) {
    'use strict';

    var ChartView = Backbone.View.extend({

        template: _.template(chartTemplate),

        events: {
            'click .remove-filter': 'removeFilter'
        },

        defaultChartOptions: {
            title: {
                text: null,
                style: { display: 'none' }
            },
            subtitle: {
                text: null,
                style: { display: 'none' }
            },
            legend: { enabled: false },
            credits: { enabled: false }
        },

        initialize: function(options) {
            this.$parent = options['parent'];
        },

        /**
         * Get Highcharts chart options object
         */
        getChart: function() {
            return {};
        },

        /**
         * Get style value
         */
        getStyle: function(type) {
            return this.model.visualisation.styles.getStyle(type, this.model);
        },

        /**
         * Handle chart feature (bar/point/etc) click
         */
        featureClick: function(e) {
            if (this.model.hasCutId(e.point.options.id)) {
                this.model.removeCut();
            } else {
                this.model.addCut(e.point.options.id);
            }
        },

        /**
         * Reset chart filters button event handler
         */
        removeFilter: function(e) {
            e.preventDefault();
            this.model.removeCut();
        },

        /**
         * Render the chart
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

            // Get chart options
            var opts = _.defaults(this.getChart(), this.defaultChartOptions);

            // Render chart
            this.$('.chart-container').highcharts(opts);
            return this;
        }

    });

    return ChartView;

});
