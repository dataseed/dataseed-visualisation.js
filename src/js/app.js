define(['module', 'jquery', 'underscore', 'backbone', './lib/sync', './views/dataset'],
    function(module, $, _, Backbone, sync, DatasetEmbedView) {
    'use strict';

    // Override Backbone sync
    Backbone.sync = sync;

    // Get base URL
    var config = module.config(),
        base_url = (_.isUndefined(config['BASE_URL'])) ? 'https://dataseedapp.com' : config['BASE_URL'];

    // Setup external API access
    var _ajax = $.ajax;
    $.extend({
        ajax: function(options) {
            options['url'] = base_url + options['url'];
            return _ajax.call(this, options);
        }
    });
});
