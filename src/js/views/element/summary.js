define(['backbone', 'underscore', '../../lib/format', 'text!../../templates/element/summary.html'],
    function(Backbone, _, format, summaryTemplate) {
    'use strict';

    var SummaryElementView = Backbone.View.extend({

        className: "inner-element",

        template: _.template(summaryTemplate),

        initialize: function(options) {
            // Bind to element models
            this.visualisation = options.visualisation;

            this.listenTo(this.model.get('settings'), 'change:measure_label', this.changeMeasureLabel);
        },

        render: function() {
            this.$el.html(this.template(_.extend({summary: this.getSummaryText()}, this.model.attributes)));

            // Setting the background and title colours
            this.$el.css('background-color', this.visualisation.styles.getStyle('background', this.model));
            this.$('h1').css('color', this.visualisation.styles.getStyle('heading', this.model));
            this.height = this.$('h1').outerHeight();
            return this;
        },

        changeMeasureLabel: function() {
            this.model.get('settings').set('label', this.model.getMeasureLabel());
        },

        getSummaryText: function() {
            var summaryText,
                element_label = this.model.get('settings').get('label'),
                total = format.num(this.model.getObservations());

            // Basic summary. It will be used if the element has no dimensions.
            summaryText = _.escape(element_label) + ': ' + total;
            this.$el.removeClass('full');

            if (this.model.dimensions.length > 0) {
                /*
                 * Build a summary text taking into account the dimensions'
                 * text_format and text_default attributes
                 */

                var text_defaults = _.reject(this.model.dimensions.map(function (d) {
                    return d.get('text_default');
                }), _.isEmpty);

                // Check if summary text has been provided
                if (text_defaults.length > 0) {

                    // Sort dimensions by the summary text "weight" property
                    var dimensions = this.model.dimensions.sortBy(function (d) {
                            return d.weight;
                        }),

                    // Get default summary text or current cut value for each element
                        summary = _.chain(dimensions.map(function (dimension) {
                            if (this.visualisation.dataset.isCut(dimension.get('field').id)) {
                                var conn = this.visualisation.dataset.pool.getConnection({
                                        type: 'dimensions',
                                        dimension: dimension.get('field').id
                                    }),
                                    value = this.visualisation.dataset.getCut(dimension.get('field').id)[0];
                                return dimension.get('text_format').replace('$', _.escape(conn.getValue(value).label));
                            } else {
                                return dimension.get('text_default');
                            }
                        }, this))
                            // Prepend measure total to summary
                            .unshift('<strong>' + total + '</strong>');

                    // Build full summary text
                    summaryText = summary.value().join(' ');
                    this.$el.addClass('full');
                }
            }

            return summaryText;
        }

    });

    return SummaryElementView;

});
