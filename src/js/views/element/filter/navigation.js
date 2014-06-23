define(['backbone', 'underscore', '../filter', 'text!../../../templates/element/filter/navigationDimension.html', 'text!../../../templates/element/filter/navigationElement.html', 'bootstrap_collapse'],
    function (Backbone, _, FilterElementView, navigationDimensionTemplate, navigationElementTemplate) {
    'use strict';

    var NavigationDimensionView = Backbone.View.extend({

        template: _.template(navigationDimensionTemplate),

        initialize: function(opts) {
            this.visualisation = opts.visualisation;
            this.navigation = opts.navigation;
            this.dimension = opts.dimension;
            this.index = opts.index;
        },

        render: function() {
            var attrs = this.navigation.getDimension(this.dimension, this.index);
            this.$el.html(this.template(_.extend({}, attrs)));
            return this;
        }

    });

    var NavigationElementView = FilterElementView.extend({

        events: {
            'click td a': 'toggleCut',
            'click h3 a': 'toggleAccordion'
        },

        template: _.template(navigationElementTemplate),

        initialize: function(options) {
            this.visualisation = options.visualisation;
            this.accordionState = {};

            this.dimensions = _(this.model.get('dimensions')).map(function (dimension, index) {
                return new NavigationDimensionView({
                    visualisation: this.visualisation,
                    navigation: this,
                    dimension: dimension,
                    index: index
                });
            }, this);
        },

        render: function () {
            this.$el.html(this.template(this.model.attributes));
            var $accordion = this.$('.accordion');

            _.each(this.dimensions, function(dimension) {
                $accordion.append(dimension.render().el);
            }, this);

            this.$('.table a').css('color', this.visualisation.styles.getStyle('featureFill', this.model));
            this.$('.table.cut a').css('color', this.visualisation.styles.getStyle('featureFillActive', this.model));
            this.$('.table.cut .active a').css('color', this.visualisation.styles.getStyle('featureFill', this.model));
            return this;
        },

        getDimension: function (dimension, index) {
            var attrs = this.getDimensionAttrs(dimension, index),
                field = this.visualisation.dataset.fields.findWhere({id: attrs.id});

            // Check if there are a cut on the filter dimensions. Show reset if so.
            if(this.model.isCut(index)) {
                this.$(".container-icon").addClass('in');
                this.$('.remove-filter').tipsy({gravity: 's'});
            }

            return {
                id: attrs.id,
                accordion_id: this.model.get('id') + '_' + attrs.id.replace(/[^a-z0-9_\-]/gi, '_'),
                label: _.isUndefined(field) ? this.model.get('label') : field.get('label'),
                cut: this.model.getCut(index),
                state: (this.accordionState[attrs.id] === true),
                values: attrs.values
            };
        },

        toggleAccordion: function(e) {
            var id = $(e.currentTarget).parents('.accordion-group').data('dimension');
            this.accordionState[id] = (this.accordionState[id] !== true);
        }

    });

    return NavigationElementView;

});
