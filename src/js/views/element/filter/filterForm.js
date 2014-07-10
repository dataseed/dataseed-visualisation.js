define(['../filter', 'underscore', 'text!../../../templates/element/filter/filterForm.html'],
    function (FilterElementView, _, filterFormTemplate) {
    'use strict';

    var FilterFormElementView = FilterElementView.extend({

        template: _.template(filterFormTemplate),

        events: {
            'change .dimension-cut': 'toggleCut'
        },

        validParent: /\d+/,

        render: function () {

            this.$el.html(this.template(this.getElementAttrs()));
            return this;
        },

        toggleCut: function (e) {
            e.preventDefault();
            var $cut = $(e.currentTarget),
                dimension = $cut.parents('.filter-group').data('dimension');

            var cutValue = $cut.find(':selected').attr('data-value');

            /**
             * The cut have to be set in a different way depending on whether
             * the dimension is hierarchical or not
             */
            if (_.isUndefined($cut.data('hlevel'))) {
                // the dimension is not hierarchical

                if (cutValue === '-all-') {
                    this.visualisation.dataset.removeCut([dimension]);
                } else {
                    this.visualisation.dataset.addCut(_.object([dimension], [cutValue]));
                }
            } else {
                // the dimension is hierarchical

                // hLevel is the level related to the select which triggered
                // the event
                var hLevel = $cut.data('hlevel');

                // If cutValue === '-all-' we want to see all the
                // observations for the level hLevel, regardless of what is
                // their hierarchical dimension's value's parent.
                //
                // Otherwise we want to drill down to the level below hlevel
                // and see all the observations for that level whose
                // hierarchical dimension's value's parent is the selected
                // value
                if (cutValue === '-all-') {
                    this.visualisation.dataset.drillUp(dimension, hLevel);
                } else {
                    if (this.validParent.test(cutValue)) {
                        this.visualisation.dataset.drillDown(dimension, hLevel, this.validParent.exec(cutValue)[0]);
                    }
                }
            }
        }

    });

    return FilterFormElementView;

});
