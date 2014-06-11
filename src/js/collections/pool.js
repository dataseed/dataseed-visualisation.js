define(['backbone', '../models/dataset/connection', '../models/dataset/dimensionalConnection' ],
    function(Backbone, Connection, DimensionalConnection) {
    'use strict';

    var ConnectionPool = Backbone.Collection.extend({

        // Polymorphic Connection models
        // http://backbonejs.org/#Collection-model
        model: function (attrs, options) {
            if (_.isUndefined(attrs.dimension)) {
                return new Connection(attrs, options);
            }
            return new DimensionalConnection(attrs, options);

        },

        initialize: function(models, options) {
            this.dataset = options.dataset;
            this.defaultCut = options.defaultCut;
        },

        getConnection: function (opts) {
            var id = this.getConnectionId(opts);

            if (_.isUndefined(this.get(id))) {
                var defaults = {
                    id: id,
                    dataset: this.dataset,
                    cut: this.defaultCut
                };
                this.add(_.extend(defaults, opts));
            }

            return this.get(id);
        },

        getConnectionId: function(opts) {
            switch(opts.type) {
                case 'dimensions':
                    // A dimension connection only depends on the dimension id:
                    // measures and aggregations do not affect the dimension
                    // values that need to be fetched.
                    return opts.type + ':' + opts.dimension;

                case 'observations':
                    var dim = (_.isUndefined(opts.dimension)) ? 'NODIM' : opts.dimension;
                    return opts.type + ':' + dim + ':' + opts.measure + ':' + opts.aggregation;

                default:
                    return _.uniqueId('conn_');
            }
        }

    });

    return ConnectionPool;

});
