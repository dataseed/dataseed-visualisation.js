define(['backbone', 'underscore', 'dataseed/models/element/dimension', 'dataseed/models/element/observations'],
        function(Backbone, _, Dimension, Observations) {
    'use strict';

    var Element = Backbone.Model.extend({

        styleDefaults: {
            'background':           '#fff',
            'heading':              '#555',
            'featureFill':          '#089fd8',
            'featureFillActive':    '#c8c8c8',
            'featureStroke':        '#fff',
            'featureStrokeActive':  '#fff',
            'label':                '#fff',
            'scaleFeature':         '#555',
            'scaleLabel':           '#555',
            'measureLabel':         '#555',
            'choroplethMin':        '#fff',
            'choroplethMax':        '#000'
        },

        url: function() {
            return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.visualisation.get('id') + '/elements/' + this.get('id');
        },

        initialize: function(options) {
            this.bind('change', this.change, this);

            // Set dataset and visualisation models
            this.dataset = options['dataset'];
            this.visualisation = options['visualisation'];

            // Only create dimension and observations models when
            // there is a single dimension
            if (this.get('dimensions').length !== 1) {
                return;
            }

            // Get this element's dimension
            var elementDimension = this.get('dimensions')[0];
            if (_.isUndefined(elementDimension)) {
                return;
            }

            // Check element dimension field ID
            if (_.isUndefined(elementDimension['field']['id'])) {
                return;
            }

            // Create dimension model
            // Note: We bind to the "sync" event as not all dimensions have associated labels
            // and so will not fire a "change" event after being fetched
            this.dimension = new Dimension({
                id: elementDimension['field']['id'],
                type: elementDimension['field']['type'],
                bucket: elementDimension['bucket'],
                element: this,
                dataset: this.dataset
            });
            this.dimension.bind('sync', this.change, this);

            // Attempt to fetch dimension model
            this.dimension.fetch();

            // Create observations model
            // Note: We bind to the "sync" event to fix bug #366
            this.observations = new Observations({
                id: elementDimension['field']['id'],
                type: elementDimension['field']['type'],
                bucket: elementDimension['bucket'],
                element: this,
                dataset: this.dataset
            });
            this.observations.bind('sync', this.change, this);

            // Set default cut
            if (_.isObject(options['defaultCut'])) {
                this.observations.cut = options['defaultCut'];
            }

            // Fetch observations
            this.observations.fetch();
        },

        /**
         * Change event handler
         */
        change: function() {
            if (this.isLoaded()) {
                this.trigger('ready', this);
            }
        },

        /*
         * Determine if the element is ready to be used/rendered
         */
        isLoaded: function() {
            // If there is no observations model specifically associated with this element
            // then it should always be loaded otherwise just return the loaded status of
            // the observations model
            return (_.isUndefined(this.observations) || this.observations.isLoaded());
        },

        /*
         * Get the dimension's field ID or null if there are multiple dimensions
         */
        getFieldId: function() {
            if (_.isUndefined(this.observations)) {
                return null;
            }
            return this.observations.get('id');
        },

        /*
         * Get all dimension labels
         */
        getLabels: function() {
            return this.dimension.getLabels();
        },

        /*
         * Get a dimension value's label
         */
        getLabel: function(value) {
            return this.dimension.getLabel(value);
        },

        /**
         * Get measure label
         */
        getMeasureLabel: function() {
            return this.get('measure_label');
        },

        /**
         * Get all observations
         */
        getObservations: function() {
            return this.observations.getObservations();
        },

        /**
         * Get the specified value for this dimension
         */
        getObservation: function(i) {
            return this.observations.getObservation(i);
        },

        /**
         * Sum the values for this dimension
         */
        getTotal: function() {
            return this.observations.getTotal();
        },

        /**
         * Get the value of the current cut for this dimension
         */
        getCut: function() {
            return this.observations.getCut();
        },

        /**
         * Get the label of the current cut for this dimension
         */
        getCutLabel: function() {
            return this.getLabel({'id': this.getCut()});
        },

        /**
         * Check if this dimension is included in the current cut
         */
        isCut: function() {
            return this.observations.isCut();
        },

        /**
         * Compares the value at the specified index to the value of the current cut for this dimension
         */
        hasCutValue: function(i) {
            return this.observations.hasCutValue(i);
        },

        /**
         * Trigger add cut event
         */
        addCut: function(value) {
            this.trigger('addCut', this.observations.get('id'), value);
        },

        /**
         * Trigger remove cut event
         */
        removeCut: function() {
            this.trigger('removeCut', this.observations.get('id'));
        },

        /**
         * Set observations cut
         */
        setCut: function(key, value) {
            if (!_.isUndefined(this.observations)) {
                // Set cut
                this.observations.setCut(key, value);

                // If we're cutting on ourselves, force a re-render
                if (this.observations.get('id') === key && this.isLoaded()) {
                    this.trigger('ready', this);
                }
            }
        },

        /**
         * Unset observations cut
         */
        unsetCut: function(key) {
            if (!_.isUndefined(this.observations)) {
                // Unset cut
                this.observations.unsetCut(key);

                // If we're removing a cut on ourselves, force a re-render
                if ((this.observations.get('id') === key || _.isUndefined(key)) && this.isLoaded()) {
                    this.trigger('ready', this);
                }
            }
        },

        /**
         * Get allowed chart types for this element's dimension field
         */
        getChartTypes: function() {
            if (!_.isUndefined(this.dimension)) {
                return this.dataset.getChartTypes(this.dimension.get('id'));
            }
            return [];
        },

        /*
         * Get the CSS style value for this dimension
         */
        getStyle: function (type, d, i) {
            // If this is a feature, check if it's active
            if (type.substring(0, 7) === 'feature' && !_.isUndefined(i) && this.observations.isCut() && !this.observations.hasCutValue(i)) {
                type += 'Active';
            }

            var style = this.get('style');
            if (!_.isUndefined(style) && _.has(style, type)) {
                // Use colour from model
                return style[type];
            }

            // Use default colour
            return this.styleDefaults[type];
        },

        /*
         * Set one or more CSS style values for this dimension
         */
        setStyles: function(updates) {
            // Get existing styles
            var style = this.get('style');
            if (_.isUndefined(style)) {
                style = {};
            }

            // Merge in new styles
            style = _.extend(style, updates);
            this.set('style', style);

            // Trigger update
            this.trigger('change');
        }

    });

    return Element;

});
