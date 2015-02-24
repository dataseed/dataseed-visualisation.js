require.config({
    baseUrl: 'src/js',
    shim: {
        'jquery': {
            exports: '$'
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
        'crossfilter': {
            exports: 'crossfilter'
        },
        'gridster': {
            deps: ['jquery'],
            exports: '$.fn.gridster'
        },
        'topojson': {
            exports: 'topojson'
        },
        'tipsy': {
            deps: ['jquery'],
            exports: '$.fn.tipsy'
        },
        'bootstrap_transition': {
            deps: ['jquery'],
            exports: '$.support.transition'
        },
        'bootstrap_collapse': {
            deps: ['bootstrap_transition'],
            exports: '$.fn.collapse'
        },
        'bootstrap_modal': {
            deps: ['bootstrap_transition'],
            exports: '$.fn.modal'
        },
        'bootstrap_alert': {
            deps: ['bootstrap_transition'],
            exports: '$.fn.alert'
        },
        'bootstrap_dropdown': {
            deps: ['bootstrap_transition'],
            exports: '$.fn.dropdown'
        },
        'spin': {
            exports: 'Spinner'
        }
    },
    paths: {
        // RequireJS Text Plugin
        text: 'components/requirejs-text/text',

        // jQuery
        jquery: 'components/jquery/jquery',

        // Underscore (Lo-Dash - http://lodash.com)
        underscore: 'components/lodash/dist/lodash.underscore',

        // Backbone
        backbone: 'components/backbone/backbone',

        // D3
        d3: 'components/d3/d3',

        // DC.js
        dc: 'components/dc.js/dc',
        crossfilter: 'components/crossfilter/crossfilter',

        // Gridster.js
        gridster: 'components/gridster/dist/jquery.gridster.min',

        // TopoJSON
        topojson: 'components/topojson/topojson',

        // Tipsy tooltips
        tipsy: 'components/tipsy/src/javascripts/jquery.tipsy',

        // Bootstrap JS
        bootstrap_transition: 'components/bootstrap/js/transition',
        bootstrap_collapse: 'components/bootstrap/js/collapse',
        bootstrap_dropdown: 'components/bootstrap/js/dropdown',
        bootstrap_modal: 'components/bootstrap/js/modal',
        bootstrap_alert: 'components/bootstrap/js/alert',

        // Spinner
        spin: 'components/spin/spin'
    }
});
