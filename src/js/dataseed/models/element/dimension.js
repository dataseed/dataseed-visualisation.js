define(['backbone', 'underscore', 'd3'],
        function(Backbone, _, d3) {
    'use strict';

    var Dimension = Backbone.Model.extend({

        /**
         * Dimension values URL
         */
        url: function() {
            return '/api/datasets/' + this.dataset.get('id') + '/dimensions/' + this.get('id');
        },

        /**
         * Init
         */
        initialize: function(options) {
            // Set dataset model
            this.dataset = options['dataset'];

            // Setup label formatters for custom types
            if (this.get('type') in this.formatters) {
                this.formatter = this.formatters[this.get('type')];
            }
        },

        /**
         * Dimension label formatting
         */
        formatter: null,

        dateFormat: d3.time.format('%d/%m/%Y'),

        formatters: {
            'date': function(timestamp) {
                return this.dateFormat(new Date(parseInt(timestamp, 10)));
            }
        },

        /*
         * Get all dimension labels
         */
        getLabels: function() {
            var labels = this.get(this.get('id'));
            if (!_.isUndefined(labels)) {
                return labels;
            }
            return {};
        },

        /*
         * Get a dimension value's label
         */
        getLabel: function(value) {
            // Get label, or use ID
            var label = this.getLabels()[value.id];
            if (_.isUndefined(label)) {
                label = {'label': value.id};
            }

            // Perform type specific label transforms
            if (this.formatter) {
                label['label'] = this.formatter(label['label']);
            }
            return label;
        }

    });

    return Dimension;

});
