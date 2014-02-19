define(['../filter', 'underscore', 'd3', 'text!../../../templates/element/filterForm.html'],
    function (FilterElementView, _, d3, filterFormTemplate) {
        'use strict';

        var FilterFormElementView = FilterElementView.extend({

            template: _.template(filterFormTemplate),

            events: {
//                'change .dimension-cut': 'toggleCut'
                'change select': 'toggleCut'
            },

            accordionState: {},

            render: function () {

                this.$el.html(this.template(this.getElementAttrs()));

                // TODO
//                this.$('.table a').css('color', this.visualisation.styles.getStyle('featureFill', this.model));
//                this.$('.table.cut a').css('color', this.visualisation.styles.getStyle('featureFillActive', this.model));
//                this.$('.table.cut .active a').css('color', this.visualisation.styles.getStyle('featureFill', this.model));

                return this;
            },

            toggleCut: function (e) {
                e.preventDefault();
                var $cut = $(e.currentTarget),
                    dimension = $cut.parents('.filter-group').data('dimension');

                var cutValue = $cut.find(':selected').data('value');

                if (cutValue === '-all-') {
                    this.visualisation.removeCut(dimension);
                } else {
                    this.visualisation.addCut(dimension, String($cut.find(':selected').data('value')));
                }
            }

        });

        return FilterFormElementView;

    });
