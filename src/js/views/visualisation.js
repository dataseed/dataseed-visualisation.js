// This view renders the base visualisation
define(['backbone', 'underscore', '../models/visualisation', './element', 'text!../templates/visualisation.html', 'masonry/masonry'],
    function(Backbone, _, Visualisation, ElementView, visualisationEmbedTemplate, Masonry) {
    'use strict';

    var VisualisationEmbedView = Backbone.View.extend({

        template: _.template(visualisationEmbedTemplate),
        templateDefaults: {},
        msnry: null,

        // Views for visualisation elements
        elementsViews: {},

        events: {
            'click .reset-filters': 'resetFilters'
        },

        initialize: function(options) {
            this.model.elements.bind('add', this.createElement, this);
            this.model.elements.bind('remove', this.removeElement, this);
            this.model.elements.bind('ready', this.renderElement, this);
            this.model.elements.bind('reset', this.resetElements, this);

            this.model.styles.bind('ready', this.renderElements, this);

        },

        /**
         * Render visualisation
         */
        render: function() {
            // Render template
            this.$el.html(this.template(_.extend(
                {
                    'dataset_id': this.model.dataset.get('id')
                },
                this.model.attributes,
                this.templateDefaults
            )));

            // Get elements container element
            this.$elements = this.$('.elements');

            // Render visualisation elements
            this.model.reset();
            this.resetElements();
        },

        layout: function() {
            if (_.size(this.elementsViews) === this.model.elements.length) {
                if (this.msnry === null) {
                    this.msnry = new Masonry(this.$elements.get(0), {
                        columnWidth: 10,
                        itemSelector: '.element'
                    });
                }
                this.msnry.reloadItems();
                this.msnry.layout();
            }
        },

        /**
         * Render all visualisation elements
         */
        renderElements: function() {
            this.model.elements.forEach(this.renderElement, this);
        },

        /**
         * Reset and render all visualisation elements
         */
        resetElements: function() {
            this.model.elements.forEach(this.addElement, this);
            this.layout();
        },

        /**
         * Create new element view
         */
        createElement: function(element) {
            var id = element.get('id');
            this.elementsViews[id] = new ElementView({
                'model': element,
                'visualisation': this.model
            });
        },

        /**
         * Add and render element view
         */
        addElement: function(element) {
            this.$elements.append(this.elementsViews[element.id].$el);
            this.renderElement(element);
        },

        /**
         * An element has been removed from the collection
         */
        removeElement: function(element) {
            var id = element.get('id');
            this.elementsViews[id].remove();
            delete this.elementsViews[id];
        },

        /**
         * Render an individual element
         */
        renderElement: function(element) {
            this.elementsViews[element.id].render();
            this.layout();
        },

        /**
         * Reset button event handler
         */
        resetFilters: function(e) {
            e.preventDefault();
            this.model.dataset.removeCut();
        }

    });

    return VisualisationEmbedView;

});
