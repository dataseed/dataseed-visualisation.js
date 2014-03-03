define(['backbone', 'underscore', './element/dimension', './element/observations'],
        function(Backbone, _, Dimension, Observations) {
    'use strict';

    var Element = Backbone.Model.extend({

        url: function() {
            return '/api/datasets/' + this.dataset.get('id') + '/visualisations/' + this.visualisation.get('id') + '/elements/' + this.get('id');
        },

        // Keeps track of the calls to this.change() (@see this.change())
        changeCount : 0,

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

            // Set default cut
            if (_.isObject(options['defaultCut'])) {
                this.dimension.cut = options['defaultCut'];
            }

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
            // this method is called when observations OR dimensions are fetched
            // we need to trigger the 'ready' event only when BOTH are fetched,
            // that is, when change is called twice.
            //
            // Note 1 - we need this counter basically only when we add a cut:
            // in that case this.isLoaded() is not enough to ensure that both
            // dimensions and observations are fetched as this.observations and
            // this.dimensions are already defined before calling fetch
            //
            // Note 2 - We should use _.after() but for some reason it doesn't
            // work in this case
            if ((++this.changeCount == 2) && this.isLoaded()) {
                this.changeCount = 0;
                this.trigger('ready', this);
            }
        },

        /*
         * Determine if the element is ready to be used/rendered
         */
        isLoaded: function() {
            // If there is no observations model specifically associated with this element
            // then it should always be loaded otherwise return true if both observations
            // and dimensions are loaded
            return (_.isUndefined(this.observations) || (this.observations.isLoaded() && this.dimension.isLoaded()));
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
         * Compares the specified ID to the ID of the current cut for this dimension
         */
        hasCutId: function(id) {
            return this.observations.hasCutId(id);
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
            this.trigger('addCut', [{"key": this.observations.get('id'), "value": value}]);
        },

        /**
         * Trigger remove cut event
         */
        removeCut: function() {
            this.trigger('removeCut', [this.observations.get('id')]);
        },

        /**
         * Set observations cut
         */
        setCut: function (cut) {
            if (!_.isUndefined(this.observations)) {
                // Set cut
                this.dimension.setCut(cut);
                this.observations.setCut(cut);
                var cutOnOurselves = _.find(cut, _.bind(function (c) {
                    return (c.key === this.observations.get('id'));
                }, this));

                // If we're cutting on ourselves, force a re-render
                if (!_.isUndefined(cutOnOurselves) && this.isLoaded()) {
                    this.trigger('ready', this);
                }
            }
        },

        /**
         * Unset observations cut
         */
        unsetCut: function (keys) {
            if (!_.isUndefined(this.observations)) {
                // Unset cut
                this.dimension.unsetCut(keys);
                this.observations.unsetCut(keys);

                var cutOnOurselves = _.find(keys, _.bind(function (k) {
                    return (k === this.observations.get('id'));
                }, this));

                // If we're removing a cut on ourselves, force a re-render
                if ((!_.isUndefined(cutOnOurselves) || _.isUndefined(keys)) && this.isLoaded()) {
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
        }

    });

    return Element;

});
