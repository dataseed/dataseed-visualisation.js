define(['./chart', 'underscore'],
    function(ChartView, _) {
    'use strict';

    var GeoChartView = ChartView.extend({

        render: function() {

            // Setup chart
            ChartView.prototype.render.apply(this, arguments);

            this.stopLoading('geo');
            return this;

        }

    });

    return GeoChartView;

});
