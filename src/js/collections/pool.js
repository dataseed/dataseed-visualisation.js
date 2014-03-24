define(['backbone', '../models/dataset/connection'],
        function(Backbone, Connection) {
    'use strict';

    var ConnectionPool = Backbone.Collection.extend({

        model: Connection,

        initialize: function(models, options) {
            this.dataset = options['dataset'];
            this.defaultCut = options['defaultCut'];
        },

        getConnection: function(opts) {
            var id = this.getConnectionId(opts),
                conn = this.get(id);

            if (_.isUndefined(conn)) {
                var defaults = {
                    id: id,
                    dataset: this.dataset,
                    cut: this.defaultCut
                };
                conn = new Connection(_.extend(defaults, opts));
                this.add(conn);
            }

            return conn;
        },

        getConnectionId: function(opts) {
            switch(opts['type']) {
                case 'dimensions':
                    return opts['type'] + ':' + opts['dimension'];

                case 'observations':
                    return opts['type'] + ':' + opts['dimension'] + ':' + opts['measure'];

                default:
                    return _.uniqueId('conn_');
            }
        }

    });

    return ConnectionPool;

});
