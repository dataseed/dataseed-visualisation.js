define(['module', 'underscore', './dataset'],
    function(module, _, Dataset) {
    'use strict';

    var data = module.config().DATASET;

    if (_.isUndefined(data)) {
        return null;
    }

    return new Dataset(data);

});
