var gulp = require('gulp'),
    _ = require('underscore'),
    jshint = require('gulp-jshint'),
    karma = require('gulp-karma'),
    rjs = require('gulp-requirejs'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    less = require('gulp-less'),
    csso = require('gulp-csso');
    connect = require('gulp-connect');

// Web server
gulp.task('serve', function() {
    connect.server({
        livereload: true,
        root: '.'
    });
});

// Lint JS
gulp.task('lint', function() {
    return gulp.src([
            'src/js/**/*.js',
            '!src/js/components/**/*.js',
            '!src/js/test/karma.conf.js',
            '!src/js/test/karma.perf.conf.js'
        ])
        .pipe(jshint({sub: true}))
        .pipe(jshint.reporter('default'));
});

// Test JS
gulp.task('test', function() {
    return gulp.src('test/spec/**/*.js')
        .pipe(karma({configFile: 'src/js/test/karma.conf.js', action: 'run'}))
        .on('error', function(err) { throw err; });
});

// Performance Test JS
gulp.task('test-perf', function() {
    return gulp.src('test/spec/**/*.js')
        .pipe(karma({configFile: 'src/js/test/karma.perf.conf.js', action: 'run'}))
        .on('error', function(err) { throw err; });
});

// Test JS (watch)
gulp.task('watch', function() {
    return gulp.src('test/spec/**/*.js')
        .pipe(karma({configFile: 'src/js/test/karma.conf.js', action: 'watch', logLevel: 'debug'}));
});

// Compile JS
var rjs_config = {
    baseUrl: 'src/js',
    mainConfigFile: 'src/js/config.js',
    name: 'components/almond/almond',
    include: ['app'],
    insertRequire: ['app'],
    almond: true,
    inlineText: true,
    preserveLicenseComments: false
};

// D3
gulp.task('js-d3', function() {
    return rjs(_.extend({out: 'dataseed.js'}, rjs_config))
        .pipe(uglify({outSourceMap: false}))
        .pipe(replace(/\s+/g, ' '))
        .pipe(gulp.dest('dist/js/'));
});

// Highcharts
gulp.task('js-highcharts', function() {
    var basePath = 'views/element/',
        paths = _.object(_.map(['chart', 'bar', 'bubble', 'geo', 'line'], function(module) {
            return [basePath + 'd3/' + module, basePath + 'highcharts/' + module];
        }));
    return rjs(_.extend({paths: paths, out: 'dataseed-highcharts.js'}, rjs_config))
        .pipe(uglify({outSourceMap: false}))
        .pipe(replace(/\s+/g, ' '))
        .pipe(gulp.dest('dist/js/'));
});

// Compile LESS
gulp.task('less', function () {
    return gulp.src('src/less/dataseed.less')
        .pipe(less({paths: ['src/less/']}))
        .pipe(csso())
        .pipe(gulp.dest('dist/css/'));
});

// Default
gulp.task('default', ['lint', 'test', 'js-d3', 'js-highcharts', 'less']);
