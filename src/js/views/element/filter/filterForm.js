define(['../filter', 'underscore', 'text!../../../templates/element/filterForm.html'],
    function (FilterElementView, _, filterFormTemplate) {
        'use strict';

        var FilterFormElementView = FilterElementView.extend({

            template: _.template(filterFormTemplate),

            events: {
                'change .dimension-cut': 'toggleCut'
            },

            render: function () {

                this.$el.html(this.template(this.getElementAttrs()));
                return this;
            },

            toggleCut: function (e) {
                e.preventDefault();
                var $cut = $(e.currentTarget),
                    dimension = $cut.parents('.filter-group').data('dimension');

                var cutValue = String($cut.find(':selected').data('value'));

                /**
                 * The cut have to be set in a different way depending on whether
                 * the dimension is hierarchical or not
                 */
                if (_.isUndefined($cut.data('hlevel'))) {
                    // the dimension is not hierarchical

                    if (cutValue === '-all-') {
                        this.visualisation.removeCut([dimension]);
                    } else {
                        this.visualisation.addCut([{"key": dimension, "value": cutValue}]);
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
                        this.visualisation.drillUp(dimension, hLevel);
                    } else {
                        var validParent_re = /\d+/;

                        if (validParent_re.test(cutValue)) {
                            this.visualisation.drillDown(dimension, hLevel, validParent_re.exec(cutValue)[0]);
                        }
                    }
                }
            }

        });

        return FilterFormElementView;

    });
