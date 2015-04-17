define(['backbone', 'underscore'],
        function(Backbone, _) {
    'use strict';

    var SharedUser = Backbone.Model.extend({
        idAttribute: 'email'
    });

    return SharedUser;

});
