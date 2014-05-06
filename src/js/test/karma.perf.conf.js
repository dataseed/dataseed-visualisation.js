module.exports = function(config) {
  config.set({
    basePath: '../',

    files: [
      'components/jquery/jquery.js',
      'components/jasmine-jquery/lib/jasmine-jquery.js',
      'config.js',
      'test/test-main.js',
      {pattern: '**/*.js', included: false},
      {pattern: '**/*.html', included: false}
    ],

    exclude: [ ],
    preprocessors: {},

    frameworks: ['jasmine', 'requirejs', 'telemetry'],
    reporters: ['dots'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,

    client: {
        useIframe: false
    },

    browsers: ['ChromeBenchmark', 'FirefoxBenchmark'],

    customLaunchers: {
        ChromeBenchmark: {
            base: 'Chrome',
            flags: ['--disable-popup-blocking', '--enable-gpu-benchmarking', '--enable-threaded-compositing']
        },
        FirefoxBenchmark: {
            base: 'Firefox',
            prefs: {
                'dom.send_after_paint_to_content': true,
                'dom.disable_open_during_load': false
            }
        }
    }
  });
};
