define(['./chart', 'underscore', 'highcharts'],
    function(ChartView, _) {
    'use strict';

    var BarChartView = ChartView.extend({

        render: function() {

            // Setup chart
            ChartView.prototype.render.apply(this, arguments);

            // Get data
            var observations = this.model.getObservations(),
                data = _.map(observations, function (d) {
                    var style = (this.model.hasCutId(d.id)) ? 'featureFillActive' : 'featureFill';
                    return {
                        id: d.id,
                        color: this.getStyle(style),
                        y: d.total
                    };
                }, this),
                categories = _.map(observations, function (d) {
                    return this.model.getLabel(d).label;
                }, this);

            // Build chart
            this.chartContainer.highcharts({
                chart: {
                    type: 'bar',
                    width: this.width,
                },
                title: {
                    text: null,
                    style: { display: 'none' }
                },
                subtitle: {
                    text: null,
                    style: { display: 'none' }
                },
                xAxis: {
                    categories: categories,
                    title: { text: null }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: this.model.getMeasureLabel(),
                        style: {
                            color: this.getStyle('measureLabel'),
                            fontWeight: 'normal'
                        }
                    },
                    labels: { overflow: 'justify' }
                },
                plotOptions: {
                    bar: {
                        dataLabels: { enabled: false },
                        events: {
                            click: _.bind(this.featureClick, this)
                        }
                    }
                },
                tooltip: {
                    pointFormat: '<b>{point.y}</b>'
                },
                legend: { enabled: false },
                credits: { enabled: false },
                series: [{
                    data: data
                }]
            });

            this.stopLoading('bar');
            return this;

        },

        getStyle: function(type) {
            return this.model.visualisation.styles.getStyle(type, this.model);
        },

        featureClick: function(e) {
            if (this.model.hasCutId(e.point.options.id)) {
                this.model.removeCut();
            } else {
                this.model.addCut(e.point.options.id);
            }
        }

    });

    return BarChartView;

});
