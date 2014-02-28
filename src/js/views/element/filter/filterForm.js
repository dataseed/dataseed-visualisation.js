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
                        this.visualisation.addCut([
                            {"key": dimension, "value": cutValue}
                        ]);
                    }
                } else {
                    // the dimension is hierarchical

                    // hLevel is the level related to the select which triggered
                    // the event
                    var hLevel = $cut.data('hlevel');

                    // list of the dimensions ids that describe the hierarchical
                    // dimension's value's ancestors at each level of the
                    // hierarchy. The list is 0-based: ancestorDimensions[i] is the
                    // hierarchical dimension's value's ancestor at level i+1
                    var ancestorDimensions = $cut.parents('.filter-group').data('ancestor_dimensions');

                    var levelAttrId = $cut.parents('.filter-group').data('level_attr_id');

                    // Reset the cut defined on the ancestor dimensions that are
                    // related to hierarchy levels equal or deeper than hLevel
                    var newCut = _.chain(ancestorDimensions.slice(0, hLevel - 1))
                        .map(function (anAttId, index) {
                            return {
                                'key': anAttId,
                                'value': null
                            };
                        })
                        .value();

                    // If cutValue === '-all-' we want to see all the
                    // observations for the level hLevel, regardless of what is
                    // their hierarchical dimension's value's parent.
                    //
                    // Otherwise, we need to set a cut on the ancestor dimension
                    // for level hLevel: we want to drill down to hlevel - 1 and
                    // see all the observations for that level whose
                    // hierarchical dimension's value's parent is the selected
                    // value
                    if (cutValue === '-all-') {
                        newCut.push({"key": levelAttrId, "value": String(hLevel)});

                    }else{
                        newCut.push({"key": levelAttrId, "value": String(hLevel - 1)});
                        newCut.push({"key": ancestorDimensions[(hLevel -1) - 1], "value": cutValue.split(':')[1]});
                    }
                    this.visualisation.addCut(newCut);
                }
            }

        });

        return FilterFormElementView;

    });
