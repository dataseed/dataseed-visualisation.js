define(['backbone', 'underscore', 'jquery', '../models/visualisation', './layout/list', './layout/grid', './element', 'text!../templates/visualisation.html', 'gridster'],
    function(Backbone, _, $, Visualisation, ListLayout, GridLayout, ElementView, visualisationEmbedTemplate) {
    'use strict';

    var VisualisationEmbedView = Backbone.View.extend({

        template: _.template(visualisationEmbedTemplate),

        elementViewType: ElementView,

        layouts: {
            grid: GridLayout,
            list: ListLayout
        },

        initialize: function() {
            // Keep reference to window object
            this.$win = $(window);

            // Views for visualisation elements
            this._views = {};

            // Set layout handler
            this._layout = new this.layouts[this.getLayout()]({
                el: this.el,
                model: this.model
            });

            // Element models event handlers
            this.listenTo(this.model.elements, 'add', this.createElement);
            this.listenTo(this.model.elements, 'remove', this.removeElement);
            this.listenTo(this.model.elements, 'element:ready', this.renderElement);
            this.listenTo(this.model.elements, 'element:scrollTo', this.scrollToElement);
            this.listenTo(this.model.elements, 'reset', this.resetElements);

            // Styles collection event hander
            this.listenTo(this.model.styles, 'ready', this.renderElements);
        },

        /**
         * Get layout class
         */
        getLayout: function() {
            // List layout for mobile devices
            if (this.$win.width() < 753) {
                return 'list';
            }
            // Grid layout for everything else
            return 'grid';
        },

        /**
         * Render visualisation
         */
        render: function() {
            // Render template
            this.$el.html(this.template(_.extend(
                {dataset_id: this.model.dataset.get('id')},
                this.model.attributes
            )));

            // Initialise layout system
            this._layout.init();

            // Render visualisation elements
            this.model.reset();

            // Set default visualisation background colour
            this.updateColour();

            // Handle window resize events
            this.$win.on('resize', _.debounce(_.bind(this.resize, this), 200));
        },

        /**
         * Add visualisation background colour
         */
        updateColour: function() {
            this.$('.visualise-view').css('background-color', this.model.styles.getStyle('visualisationBackground'));
        },

        resize: function() {
            this._layout.resize();
            this.model.elements.forEach(this.resizeElement, this);
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
         * Add element view
         */
        addElement: function(element) {
            this._layout.addElement(
                element,
                this._views[element.cid].$el
            );
            if (element.isLoaded()) {
                this.renderElement(element);
            }
        },

        /**
         * An element has been removed from the collection
         */
        removeElement: function(element) {
            this._layout.removeElement(
                element,
                this._views[element.cid].$el
            );
            this._views[element.cid].remove();
            delete this._views[element.cid];
        },

        /**
         * Render an individual element
         *
         * This is also the handler for the 'element:ready' event which is
         * triggered by an element model when the visualisation element is ready
         * to be rendered (that is, all its connections have been synced)
         */
        renderElement: function(element) {
            this._views[element.cid].render();
        },

        /**
         * Resize an individual element
         */
        resizeElement: function(element) {
            this._layout.resizeElement(
                element,
                this._views[element.cid].$el,
                _.bind(this.renderElement, this, element)
            );
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
                viewportTop = this.$win.scrollTop(),
                viewportBottom = viewportTop + this.$win.height();

            // If the element isn't visible then scroll the document
            if ((elTop > viewportBottom) || (elBottom < viewportTop)) {
                $('html, body').animate({scrollTop: elTop}, 1000);
            }
        }

    });

    return VisualisationEmbedView;

});
