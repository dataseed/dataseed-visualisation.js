define(['module', 'jquery', 'underscore', 'lib/sync', 'dataseed/views/dataset'], function(module, $, _, sync, DatasetEmbedView) {
    'use strict';

    // Override Backbone sync
    Backbone.sync = sync;

    // Get base URL
    var config = module.config(),
        base_url = (_.isUndefined(config['BASE_URL'])) ? 'https://getdataseed.com' : config['BASE_URL'];

    // Setup external API access
    var _ajax = $.ajax;
    $.extend({
        ajax: function(options) {
            options['url'] = base_url + options['url'];
            return _ajax.call(this, options);
        }
    });
});
