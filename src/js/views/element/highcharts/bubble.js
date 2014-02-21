define(['./chart', 'underscore'],
    function(ChartView, _) {
    'use strict';

    var BubbleChartView = ChartView.extend({

        render: function() {

            // Setup chart
            ChartView.prototype.render.apply(this, arguments);

            this.stopLoading('bubble');
            return this;

        }

    });

    return BubbleChartView;

});
