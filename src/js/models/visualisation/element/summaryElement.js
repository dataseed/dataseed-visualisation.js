define(['backbone', 'underscore', '../element'],
    function (Backbone, _, Element) {
        'use strict';

        var SummaryElement = Element.extend({

            initConnections: function () {
                var values = {
                    measure: _.isNull(this.get('measure')) ? null : this.get('measure').id,
                    aggregation: this.get('aggregation')
                };

                var observations = this.dataset.pool.getConnection(_.extend({type: 'observations'}, values));
                // Bind to sync event and keep references
                observations.bind('sync', this.onConnectionSync, this);
                this.observations.push(observations);

                // Update connection sync count
                if (observations.isLoaded()) {
                    this._connectionsSynced.observations++;
                }
            },

            getData: function (dimensionId) {
                var conn = this.getElementConnection('observations', dimensionId);

                if (!_.isUndefined(conn)) {
                    return conn.getData();
                }
            }

        });

        return SummaryElement;

    });
