require.config({
    baseUrl: 'src/js',
    shim: {
        'jquery': {
            exports: 'jQuery'
        },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'd3': {
            exports: 'd3'
        },
        'tipsy': {
            deps: ['jquery'],
            exports: 'jQuery.fn.tipsy'
        },
        'bootstrap_transition': {
            deps: ['jquery'],
            exports: 'jQuery.support.transition'
        },
        'bootstrap_collapse': {
            deps: ['bootstrap_transition'],
            exports: 'jQuery.fn.collapse'
        },
        'bootstrap_modal': {
            deps: ['bootstrap_transition'],
            exports: 'jQuery.fn.modal'
        },
        'bootstrap_alert': {
            deps: ['bootstrap_transition'],
            exports: 'jQuery.fn.alert'
        },
        'bootstrap_dropdown': {
            deps: ['bootstrap_transition'],
            exports: 'jQuery.fn.dropdown'
        },
        'spin': {
            exports: 'Spinner'
        },
        'markdown': {
            exports: 'markdown'
        }
    },
    paths: {
        // RequireJS Text Plugin
        text: '../components/requirejs-text/text',

        // jQuery
        jquery: '../components/jquery/jquery.min',

        // Underscore (Lo-Dash - http://lodash.com)
        underscore: '../components/lodash/dist/lodash.underscore.min',

        // Backbone
        backbone: '../components/backbone/backbone-min',

        // D3
        d3: '../components/d3/d3',

        // Tipsy tooltips
        tipsy: '../components/tipsy/src/javascripts/jquery.tipsy',

        // Bootstrap JS
        bootstrap_transition: '../components/bootstrap/js/bootstrap-transition',
        bootstrap_collapse: '../components/bootstrap/js/bootstrap-collapse',
        bootstrap_dropdown: '../components/bootstrap/js/bootstrap-dropdown',
        bootstrap_modal: '../components/bootstrap/js/bootstrap-modal',
        bootstrap_alert: '../components/bootstrap/js/bootstrap-alert',

        // Spinner
        spin: '../components/spin/spin',

        // Markdown.js
        markdown: '../components/markdown/lib/markdown'

    }
});
