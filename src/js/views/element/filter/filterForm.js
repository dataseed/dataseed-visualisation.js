define(['../filter', 'underscore', 'text!../../../templates/element/filterForm.html'],
    function (FilterElementView, _, filterFormTemplate) {
        'use strict';

        var FilterFormElementView = FilterElementView.extend({

            template: _.template(filterFormTemplate),

            events: {
                'change .dimension-cut': 'toggleCut'
            },

            accordionState: {},

            render: function () {

                this.$el.html(this.template(this.getElementAttrs()));
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
