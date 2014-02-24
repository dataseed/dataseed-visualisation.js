define(['./chart', 'underscore', 'highcharts_more'],
    function(ChartView, _) {
    'use strict';

    var BubbleChartView = ChartView.extend({

        getChart: function() {
            return {
                chart: {
                    type: 'bubble',
                    zoomType: 'xy',
                    width: this.width,
                },
                plotOptions: {
                    bubble: {
                        animation: false,
                        color: this.getStyle('featureFill'),
                    }
                },
                tooltip: {
                    useHTML: true,
                    headerFormat: '',
                    pointFormat: '{point.name}<br/><b>{point.y}</b>'
                },
                series: [{
                    data: _.map(this.model.getObservations(), function (d) {
                        var point = {
                            id: d.id,
                            name: this.model.getLabel(d).label,
                            z: d.total,
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

    return BubbleChartView;

});
