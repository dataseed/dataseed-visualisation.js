define(['backbone', 'underscore'],
    function(Backbone, _) {
    'use strict';

    var Auth = Backbone.Model.extend({

        getParams: function() {
            return 'auth_msg=' + encodeURIComponent(this.get('msg')) + '&auth_hmac=' + encodeURIComponent(this.get('hmac'));
        }

    });

    return Auth;

});
