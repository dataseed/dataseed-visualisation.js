define(['module', 'underscore', './auth'],
    function(module, _, Auth) {
    'use strict';

    var data = module.config().AUTH;

    if (_.isUndefined(data)) {
        return undefined;
    }

    return new Auth(data);

});
