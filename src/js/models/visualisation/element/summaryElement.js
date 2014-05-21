define(['backbone', 'underscore', '../element'],
    function (Backbone, _, Element) {
        'use strict';

        var SummaryElement = Element.extend({

            initialize: function (options) {
                this.bind('change', this.change, this);

                // Set dataset and visualisation models
                this.dataset = options['dataset'];
                this.visualisation = options['visualisation'];

                // Get dimensions and observations models
                this.dimensions = [];
                this.observations = [];

                if (this.get('display') === false) {
                    // No need to add connections for a hidden element
                    return;
                }

                var values = {
                    measure: _.isNull(this.get('measure')) ? null : this.get('measure')['id'],
                    aggregation: this.get('aggregation')
                };

                var observations = this.dataset.pool.getConnection(_.extend({type: 'observations'}, values));
                // Bind to sync event and keep references
                observations.bind('sync', this.change, this);
                this.observations.push(observations);
            },

            getData: function (dimensionId) {
                var conn = this.getElementConnection("observations", dimensionId);

                if (!_.isUndefined(conn)) {
                    return conn.getData();
                }
            }

        });

        return SummaryElement;

    });
