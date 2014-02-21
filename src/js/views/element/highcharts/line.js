define(['./chart', 'underscore'],
    function(ChartView, _) {
    'use strict';

    var LineChartView = ChartView.extend({

        render: function() {

            // Setup chart
            ChartView.prototype.render.apply(this, arguments);

            this.stopLoading('line');
            return this;

        }

    });

    return LineChartView;

});
