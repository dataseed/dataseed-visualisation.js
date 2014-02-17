define(['backbone', 'underscore', 'd3', 'text!../../templates/element/navigation.html', 'bootstrap_collapse'],
    function(Backbone, _, d3, navigationTemplate) {
    'use strict';

    var NavigationElementView = Backbone.View.extend({

        template: _.template(navigationTemplate),

        events: {
            'click .dimension-cut': 'toggleCut',
            'click h3 a':           'toggleAccordion'
        },

        accordionState: {},

        initialize: function(options) {
            // Initialise number formatter
            this.numFormat = d3.format(',');

            // Bind to element models
            this.visualisation = options['visualisation'];
            this.visualisation.elements.bind('ready', this.render, this);
        },

        render: function() {
            var attrs = {
                'id': this.model.get('id'),
                'label': this.model.get('label'),
                'dimensions': this.getDimensions()
            };

            this.$el.html(this.template(attrs));

            this.$('.table a').css('color', this.visualisation.styles.getStyle('featureFill', this.model));
            this.$('.table.cut a').css('color', this.visualisation.styles.getStyle('featureFillActive', this.model));
            this.$('.table.cut .active a').css('color', this.visualisation.styles.getStyle('featureFill', this.model));

            return this;
        },

        getDimensions: function() {
            return _(this.model.get('dimensions')).map(function(dimension) {

                var id = dimension.field.id,
                    model = this.visualisation.elements.find(function(element) {
                        return (element.getFieldId() === id);
                    }),
                    values = _.chain(model.getObservations())
                        .map(function(value, index) {
                            return {
                                'id': value['id'],
                                'total': value['total'],
                                'totalFormat': this.numFormat(value['total']),
                                'label': model.getLabel(value)['label']
                            };
                        }, this)
                        .sortBy('total')
                        .value();

                // Sort descending
                values.reverse();

                return {
                    'id': id,
                    'accordion_id': this.model.get('id') + '_' + id.replace(/[^a-z0-9_\-]/gi, '_'),
                    'label': model.get('label'),
                    'cut': model.getCut(),
                    'state': (this.accordionState[id] === true),
                    'values': values
                };

            }, this);
        },

        toggleCut: function(e) {
			e.preventDefault();
            var $cut = $(e.currentTarget),
                dimension = $cut.parents('.accordion-group').data('dimension');
            if ($cut.parents('tr').hasClass('active')) {
                this.visualisation.removeCut(dimension);
            } else {
                this.visualisation.addCut(dimension, String($cut.data('value')));
            }
        },

        toggleAccordion: function(e) {
            var id = $(e.currentTarget).parents('.accordion-group').data('dimension');
            this.accordionState[id] = (this.accordionState[id] !== true);
        }

    });

    return NavigationElementView;

});
