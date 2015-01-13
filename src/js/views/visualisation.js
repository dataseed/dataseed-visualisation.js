// This view renders the base visualisation
define(['backbone', 'underscore', 'jquery', '../models/visualisation', './element', 'text!../templates/visualisation.html'],
    function(Backbone, _, $, Visualisation, ElementView, visualisationEmbedTemplate) {
    'use strict';

    var VisualisationEmbedView = Backbone.View.extend({

        template: _.template(visualisationEmbedTemplate),
        templateDefaults: {},

        events: {
            'click .reset-filters': 'resetFilters'
        },

        elementViewType: ElementView,
        initialize: function(options) {
            // Views for visualisation elements
            this._views = {};

            // Element models event handlers
            this.model.elements.bind('add', this.createElement, this);
            this.model.elements.bind('remove', this.removeElement, this);
            this.model.elements.bind('element:ready', this.renderElement, this);
            this.model.elements.bind('element:needResize', this.needResizeElement, this);
            this.model.elements.bind('element:resize', this.resizeElement, this);
            this.model.elements.bind('element:scrollTo', this.scrollToElement, this);
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
            this._views[element.cid] = new this.elementViewType({
                model: element,
                visualisation: this.model
            });
            this.addElement(element);
        },

        /**
         * Add and render element view
         */
        addElement: function(element) {
            this._views[element.cid].$el.appendTo(this.$('.elements'));
        },

        /**
         * An element has been removed from the collection
         */
        removeElement: function(element) {
            this._views[element.cid].remove();
            delete this._views[element.cid];
        },

        /**
         * Render an individual element.
         *
         * This is also the handler for the 'element:ready: event which is
         * triggered by an element model when the visualisation element is ready
         * to be rendered (that is, all its connections have been synched)
         */
        renderElement: function(element) {
            this._views[element.cid].render();
        },

        needResizeElement: function(element) {
            this._views[element.cid].needResize();
        },

        /**
         * Resize and re-render an individual element.
         */
        resizeElement: function(element) {
            this._views[element.cid].resize();
        },

        /**
         * Scroll page to an element
         */
        scrollToElement: function(element) {
            // Get element coordinates
            var $el = this._views[element.cid].$el,
                elTop = $el.offset().top,
                elBottom = elTop + $el.outerHeight(),

                // Get viewport coordinates
                $win = $(window),
                viewportTop = $win.scrollTop(),
                viewportBottom = viewportTop + $win.height();

            // If the element isn't visible then scroll the document
            if ((elTop > viewportBottom) || (elBottom < viewportTop)) {
                $('html, body').animate({scrollTop: elTop}, 1000);
            }
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
