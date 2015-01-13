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
    preprocessors: { },

    frameworks: ['jasmine', 'requirejs'],
    reporters: ['story'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: false,

    browsers: ['PhantomJS', 'Firefox']

  });
};
