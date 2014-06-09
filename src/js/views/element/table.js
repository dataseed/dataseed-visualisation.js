define(['backbone', 'underscore', '../../lib/format', 'text!../../templates/element/table.html'],
    function(Backbone, _, format, tableTemplate) {
    'use strict';

    var TableChartView = Backbone.View.extend({

        events: {
            'click .remove-filter': 'removeFilter',
            'click .table-row a': 'featureClick',
            'click .table-sort': 'sortSelect'
        },

        template: _.template(tableTemplate),

        sortProperty: 'total',
        sortDirection: -1,

        // Chart constants
        margin: 19,
        rowHeight: 29,
        maxHeight: 600,

        initialize: function() {
            // Calculating the minimum height for the table chart
            this.minHeight = Math.min((this.getTableValues().length * this.rowHeight) + this.margin, this.maxHeight);
        },

        render: function() {
            var attrs = _.extend({
                values: this.getTableValues(),
                cut: this.model.getCut(),
                sortProperty: this.sortProperty,
                sortDirection: this.sortDirection
            }, this.model.attributes);

            this.$el.html(this.template(attrs));

            this.resetButtonDisplay();

            // Add the fix height to the table chart
            this.$('.chart-container').css('min-height', this.minHeight);

            this.resetFeatures();
            return this;
        },

        getTableValues: function() {
            var values = _.chain(this.model.getObservations())
                //._map transforms an array to another array
                //value parameter is the value of the chained getObservation
                .map(function(value, index) {
                    //_.extend used to add more objects to the value object
                    return {
                        index: index,
                        id: value.id,
                        total: value.total,
                        totalFormat: format.num(value.total),
                        label: this.model.getLabel(value).label
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

        featureClick: function(e) {
            e.preventDefault();
            var index = $(e.currentTarget).parents('tr').data('index');
            if (this.model.featureClick(index)) {
                this.resetFeatures();
            }
        },

        sortSelect: function(e) {
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

        /**
         * Reset table chart filters button event handler
         */
        removeFilter: function(e) {
            e.preventDefault();
            this.model.removeCut();
            this.resetFeatures();
            $('.tipsy').remove();
        },

        resetFeatures: function() {
            // Get the colours from the model
            var featureFill = this.model.visualisation.styles.getStyle('featureFill', this.model);
            var backgroundColour = this.model.visualisation.styles.getStyle('background', this.model);
            var headingColour = this.model.visualisation.styles.getStyle('heading', this.model);

            if (this.model.isCut()) {
                var featureFillActive = this.model.visualisation.styles.getStyle('featureFillActive', this.model);
                this.$('.table-row a').css('color', featureFillActive);
                this.$('.table-row[data-id="' + this.model.getCut() + '"] a').css('color', featureFill);
                this.$('h2').css('color', headingColour);
            }
            else {
                this.$('.table-row a').css('color', featureFill);
                this.$('h2').css('color', headingColour);
                this.$el.parent().css('background-color', backgroundColour);
            }
        },

        /**
         * Shows reset button only when there is a cut on the dimension
         */
        resetButtonDisplay: function() {
            if(this.model.isCut()) {
                this.$(".container-icon").addClass('in');
                this.$('.remove-filter').tipsy({gravity: 's'});
            }
        }


    });

    return TableChartView;

});
