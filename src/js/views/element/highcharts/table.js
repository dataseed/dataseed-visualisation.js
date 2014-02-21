define(['./chart', 'underscore'],
    function(ChartView, _) {
    'use strict';

    var TableChartView = ChartView.extend({

        render: function() {

            // Setup chart
            ChartView.prototype.render.apply(this, arguments);

            this.stopLoading('table');
            return this;

        }

    });

    return TableChartView;

});
