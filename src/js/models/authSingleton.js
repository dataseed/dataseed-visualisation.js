define(['module', 'underscore', './auth'],
    function(module, _, Auth) {
    'use strict';

    var data = module.config().AUTH;

    if (_.isUndefined(data)) {
        return null;
    }

    return new Auth(data);

});
