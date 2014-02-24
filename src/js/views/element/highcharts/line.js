define(['./chart', 'underscore', 'highcharts'],
    function(ChartView, _) {
    'use strict';

    var LineChartView = ChartView.extend({

        getChart: function() {
            return {
                chart: {
                    type: 'line',
                    width: this.width,
                },
                plotOptions: {
                    line: {
                        animation: false,
                        color: this.getStyle('featureFill'),
                        dataLabels: { enabled: false },
                        events: {
                            click: _.bind(this.featureClick, this)
                        }
                    }
                },
                xAxis: {
                    categories: _.map(this.model.getObservations(), function (d) {
                        return this.model.getLabel(d).label;
                    }, this),
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
                tooltip: {
                    pointFormat: '<b>{point.y}</b>'
                },
                series: [{
                    data: _.map(this.model.getObservations(), function (d) {
                        var point = {
                            id: d.id,
                            y: d.total
                        };
                        if (this.model.hasCutId(d.id)) {
                           point['color'] = this.getStyle('featureFillActive');
                        }
                        return point;
                    }, this)
                }]
            };
        }

    });

    return LineChartView;

});
