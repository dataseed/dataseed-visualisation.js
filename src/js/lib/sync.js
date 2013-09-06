define(['backbone', 'underscore'], function(Backbone, _) {
    'use strict';

    // Save reference to Backbone.sync for later
    var backboneSync = Backbone.sync;

    var sync = function(method, model, options) {

        // Only use trailing slashes for POST requests
        if (method === 'create') {

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

            // If the URL doesn't end in a trailing slash, add one
            if (options.url.length > 1 && options.url.lastIndexOf('/') !== options.url.length-1) {
                options.url += '/';
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
