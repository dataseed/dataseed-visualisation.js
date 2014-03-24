define(['../filter', 'underscore', 'text!../../../templates/element/navigation.html', 'bootstrap_collapse'],
    function (FilterElementView, _, navigationTemplate) {
    'use strict';

    var NavigationElementView = FilterElementView.extend({

        template: _.template(navigationTemplate),

        events: {
            'click .dimension-cut': 'toggleCut',
            'click h3 a': 'toggleAccordion'
        },

        accordionState: {},

        render: function () {

            this.$el.html(this.template(this.getElementAttrs()));

            this.$('.table a').css('color', this.visualisation.styles.getStyle('featureFill', this.model));
            this.$('.table.cut a').css('color', this.visualisation.styles.getStyle('featureFillActive', this.model));
            this.$('.table.cut .active a').css('color', this.visualisation.styles.getStyle('featureFill', this.model));

            return this;
        },

        getDimensions: function () {
            return _(this.model.get('dimensions')).map(function (dimension, iterator) {

                var dimensionAttrs = this.getDimensionAttrs(dimension);

                var id = dimensionAttrs.id,
                    values = dimensionAttrs.values,
                    field = this.visualisation.dataset.fields.findWhere({'id':id});

                return {
                    'id': id,
                    'accordion_id': this.model.get('id') + '_' + id.replace(/[^a-z0-9_\-]/gi, '_'),
                    'label': _.isUndefined(field) ? this.model.get('label') : field.get('label'),
                    'cut': this.model.getCut(iterator),
                    'state': (this.accordionState[id] === true),
                    'values': values
                };

            }, this);
        },

        toggleAccordion: function (e) {
            var id = $(e.currentTarget).parents('.accordion-group').data('dimension');
            this.accordionState[id] = (this.accordionState[id] !== true);
        }

    });

    return NavigationElementView;

});
