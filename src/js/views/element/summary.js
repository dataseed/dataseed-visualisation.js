define(['backbone', 'underscore', '../../lib/format', 'text!../../templates/element/summary.html'],
    function(Backbone, _, format, summaryTemplate) {
    'use strict';

    var SummaryElementView = Backbone.View.extend({

        template: _.template(summaryTemplate),

        initialize: function(options) {
            // Bind to element models
            this.visualisation = options['visualisation'];
            this.visualisation.elements.bind('ready', this.render, this);
        },

        render: function() {
            this.$el.html(this.template(_.extend({'summary': this.getSummaryText()}, this.model.attributes)));
            return this;
        },

        getSummaryText: function() {

            var summaryText = '',
                measure = this.model.getMeasureLabel();

            if (this.visualisation.elements.length > 0) {

                // Get aggregate total
                var dimensions = _(this.model.get('dimensions')).chain(),
                    dimensionElements = this.visualisation.elements.chain().filter(function(element) {
                        return !_.isUndefined(element.observations);
                    }),
                    total = format.num(dimensionElements.first().value().getTotal());

                // Check if summary text has been provided
                if (dimensions.pluck('text_default').reject(_.isEmpty).size().value() > 0) {

                    // Sort dimensions by the summary text "weight" property
                    dimensions = dimensions.sortBy(function(d) {
                        return d.weight;
                    });

                    // Get default summary text or current cut value for each element
                    var summary = dimensions.map(function(dimension) {
                            var element = dimensionElements.findWhere({'id': dimension.field.id}).value();
                            if (!_.isUndefined(element) && element.isCut()) {
                                return dimension.text_format.replace('$', _.escape(element.getCutLabel().label));
                            } else {
                                return dimension.text_default;
                            }
                        })
                        // Prepend measure total to summary
                        .unshift('<strong>' + total + '</strong>');

                    // Build full summary text
                    summaryText = summary.value().join(' ');
                    this.$el.addClass('full');

                } else {

                    // Use basic summary
                    summaryText = _.escape(measure) + ': ' + total;
                    this.$el.removeClass('full');

                }

            }

            return summaryText;

        }

    });

    return SummaryElementView;

});
