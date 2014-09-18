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
        'topojson': {
            exports: 'topojson'
        },
        'highcharts': {
            deps: ['jquery'],
            exports: 'Highcharts'
        },
        'highcharts_more': {
            deps: ['highcharts'],
            exports: 'Highcharts'
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
        },
        'markdown': {
            exports: 'markdown'
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

        // TopoJSON
        topojson: 'components/topojson/topojson',

        // Highcharts
        highcharts: 'components/highcharts/highcharts.src',
        highcharts_more: 'components/highcharts/highcharts-more.src',

        // Tipsy tooltips
        tipsy: 'components/tipsy/src/javascripts/jquery.tipsy',

        // Bootstrap JS
        bootstrap_transition: 'components/bootstrap/js/bootstrap-transition',
        bootstrap_collapse: 'components/bootstrap/js/bootstrap-collapse',
        bootstrap_dropdown: 'components/bootstrap/js/bootstrap-dropdown',
        bootstrap_modal: 'components/bootstrap/js/bootstrap-modal',
        bootstrap_alert: 'components/bootstrap/js/bootstrap-alert',

        // Spinner
        spin: 'components/spin/spin',

        // Markdown.js
        markdown: 'components/markdown/lib/markdown',

        outlayer: 'components/outlayer',
        eventie: 'components/eventie',
        'doc-ready': 'components/doc-ready',
        eventEmitter: 'components/eventEmitter',
        'get-size': 'components/get-size',
        'get-style-property': 'components/get-style-property',
        'matches-selector': 'components/matches-selector'

    }
});
