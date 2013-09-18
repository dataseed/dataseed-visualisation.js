define(['backbone', 'underscore', 'dataseed/models/authSingleton'], function(Backbone, _, authSingleton) {
    'use strict';

    // Save reference to Backbone.sync for later
    var backboneSync = Backbone.sync;

    var sync = function(method, model, options) {

        if (method === 'create' || !_.isUndefined(authSingleton)) {

            // Get model URL
            if (!options.url) {
                options.url = _.result(model, 'url');
                if (!options.url) {
                    throw new Error('Invalid model URL');
                }
            }

            // Split URL on query
            var urlParts = options.url.split('?');
            options.url = urlParts.shift();

            // If the URL doesn't end in a trailing slash and this is a POST request, add one
            if (method === 'create' && options.url.length > 1 && options.url.lastIndexOf('/') !== options.url.length-1) {
                options.url += '/';
            }

            // If authentication information has been supplied, add to the URL parameters
            if (!_.isUndefined(authSingleton)) {
                if (urlParts.length === 0) {
                    urlParts[0] = '';
                } else if (urlParts[0].length > 0) {
                    urlParts[0] += '&';
                }
                urlParts[0] += authSingleton.getParams();
            }

            // Append URL query
            if (urlParts.length > 0) {
                options.url += '?' + urlParts.join('?');
            }

        }

        // Run Backbone.sync
        return backboneSync.apply(this, [method, model, options]);
    };

    return sync;

});
