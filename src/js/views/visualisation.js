// This view renders the base visualisation
define(['backbone', 'underscore', '../models/visualisation', './element', 'text!../templates/visualisation.html', 'masonry/masonry'],
    function(Backbone, _, Visualisation, ElementView, visualisationEmbedTemplate, Masonry) {
    'use strict';

    var VisualisationEmbedView = Backbone.View.extend({

        template: _.template(visualisationEmbedTemplate),
        templateDefaults: {},
        msnry: null,
        store: [], //array to store the charts that has been loaded

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

        // Masonry.js function
        layout: function() {
            //when msnry obj has not been created and all the charts have been rendered. create msnry obj
            if (this.store.length === this.model.elements.length && this.msnry === null) {
                this.msnry = new Masonry(this.$elements.get(0), {
                    columnWidth: 10,
                    itemSelector: '.element'
                });
            }
            //recall layout if created
            if (this.store.length === this.model.elements.length) {
                this.msnry.layout();
                this.msnry.reloadItems();
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
            //call layout() when all the elements are reseted
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

            // clear the store counter array when customise is active. So masonary waits until all the element
            // have been loaded
            if($('.customise-menu').length !== 0 && this.store.length === this.model.elements.length) {
                this.store = [];
            }

            // Checking if the chart element has already been created and adding to the count
            if(this.store.indexOf(element.id) === -1) {
                this.store.push(element.id);
            }
            this.layout();
        },

        /**
         * Reset button event handler
         */
        resetFilters: function(e) {
            e.preventDefault();
            this.model.removeCut();
        }

    });

    return VisualisationEmbedView;

});
