define(['../chart', 'underscore', 'd3', 'text!../../../templates/element/table.html'],
    function(ChartView, _, d3, tableTemplate) {
    'use strict';

    var TableChartView = ChartView.extend({

        events: {
            'click .remove-filter': 'removeFilter',
            'click .table-row a': 'selectRow',
            'click .table-sort': 'sortSelect'
        },

        template: _.template(tableTemplate),

        sortProperty: 'total',
        sortDirection: -1,

        initialize: function() {
            this.numFormat = d3.format(',');
        },

        render: function() {
            //.extend() adds values to the attributes in model
            var attrs = _.extend({
                'values': this.getTableValues(),
                'cut': this.model.getCut(),
                'sortProperty': this.sortProperty,
                'sortDirection': this.sortDirection
            }, this.model.attributes);

            this.$el.html(this.template(attrs));

            this.resetFeatures();

            // Remove the load spinner when chart finished loading.
            this.stopLoading('table');

            return this;
        },

        getTableValues: function() {
            var values = _.chain(this.model.getObservations())
                //._map transforms an array to another array
                //value parameter is the value of the chained getObservation
                .map(function(value, index) {
                    //_.extend used to add more objects to the value object
                    return {
                        'index': index,
                'id': value['id'],
                'total': value['total'],
                'totalFormat': this.numFormat(value['total']),
                'label': this.model.getLabel(value)['label']
                    };
                }, this)
                //sort the object by the current sorting property
                .sortBy(this.sortProperty)
                //value() to return the value only and not the wrapped methods in _.chain()
                .value();

            if (this.sortDirection === -1) {
                values.reverse();
            }

            return values;
        },

        selectRow: function(e) {
            e.preventDefault();
            this.featureClick(null, $(e.currentTarget).parents('tr').data('index'));
        },

        sortSelect: function(e) {
            //stops <a> from putting # in url
            e.preventDefault();
            var $sort = $(e.currentTarget);

            //if the same th sort header is selected then change the direction, else switch the th
            if ($sort.data('sort-property') === this.sortProperty) {
                this.sortDirection *= -1;
            } else {
                this.sortProperty = $sort.data('sort-property');
            }

            this.render();
            return;
        },

        resetFeatures: function() {
            var featureFill = this.model.visualisation.styles.getStyle('featureFill', this.model);
            if (this.model.isCut()) {
                this.$('.table-row a').css('color', this.model.visualisation.styles.getStyle('featureFillActive', this.model));
                this.$('.table-row[data-id="' + this.model.getCut() + '"] a').css('color', featureFill);
            }
            else {
                this.$('.table-row a').css('color', featureFill);
            }
        }


    });

    return TableChartView;

});
