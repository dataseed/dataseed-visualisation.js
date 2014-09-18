// This view renders the base visualisation
define(['backbone', 'underscore', '../models/visualisation', './element', 'text!../templates/visualisation.html'],
    function(Backbone, _, Visualisation, ElementView, visualisationEmbedTemplate) {
    'use strict';

    var VisualisationEmbedView = Backbone.View.extend({

        template: _.template(visualisationEmbedTemplate),
        templateDefaults: {},

        events: {
            'click .reset-filters': 'resetFilters'
        },

        initialize: function(options) {
            // Views for visualisation elements
            this.views = {};

            // Element models event handlers
            this.model.elements.bind('add', this.createElement, this);
            this.model.elements.bind('remove', this.removeElement, this);
            this.model.elements.bind('element:ready', this.renderElement, this);
            this.model.elements.bind('element:resize', this.resizeElement, this);
            this.model.elements.bind('reset', this.resetElements, this);

            // Styles collection event hander
            this.model.styles.bind('ready', this.renderElements, this);
        },

        /**
         * Render visualisation
         */
        render: function() {
            // Render template
            this.$el.html(this.template(_.extend(
                {dataset_id: this.model.dataset.get('id')},
                this.model.attributes,
                this.templateDefaults
            )));

            // Render visualisation elements
            this.model.reset();
            this.resetElements();

            // Set default visualisation background colour
            this.updateColour();
        },

        /**
         * Add visualisation background colour
         */
        updateColour: function() {
            this.$('.visualisation').css('background-color', this.model.styles.getStyle('visualisationBackground'));
        },

        /**
         * Render all visualisation elements
         */
        renderElements: function() {
            this.model.elements.forEach(this.renderElement, this);
            this.updateColour();
        },

        /**
         * Reset and render all visualisation elements
         */
        resetElements: function() {
            this.model.elements.forEach(this.addElement, this);
        },

        /**
         * Create new element view
         */
        createElement: function(element) {
            var id = element.get('id');
            this.views[id] = new ElementView({
                model: element,
                visualisation: this.model
            });
        },

        /**
         * Add and render element view
         */
        addElement: function(element) {
            this.$('.elements').append(this.views[element.id].$el);
        },

        /**
         * An element has been removed from the collection
         */
        removeElement: function(element) {
            var id = element.get('id');
            this.views[id].remove();
            delete this.views[id];
        },

        /**
         * Render an individual element.
         *
         * This is also the handler for the 'element:ready: event which is
         * triggered by an element model when the visualisation element is ready
         * to be rendered (that is, all its connections have been synched)
         */
        renderElement: function(element) {
            this.views[element.id].render();
        },

        /**
         * Resize and re-render an individual element.
         */
        resizeElement: function(element) {
            this.views[element.id].resize();
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
