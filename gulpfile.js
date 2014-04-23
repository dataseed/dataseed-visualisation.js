var gulp = require('gulp'),
    _ = require('underscore'),
    jshint = require('gulp-jshint'),
    karma = require('gulp-karma'),
    rjs = require('gulp-requirejs'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    csso = require('gulp-csso');

// Configuration
var conf = {
    js: {
        rjs: {
            baseUrl: 'src/js',
            mainConfigFile: 'src/js/config.js',
            name: 'components/almond/almond',
            include: ['app'],
            insertRequire: ['app'],
            almond: true,
            inlineText: true,
            preserveLicenseComments: false
        },
        charts: ['chart', 'bar', 'bubble', 'geo', 'line'],
        outDir: 'dist/js/'
    },
    less: {
        src: 'src/less/dataseed.less',
        paths: ['src/less/'],
        outDir: 'dist/css/'
    }
};

// Lint JS
gulp.task('lint', function() {
    return gulp.src([
            conf.js.rjs.baseUrl + '/**/*.js',
            '!' + conf.js.rjs.baseUrl + '/components/**/*.js'
        ])
        .pipe(jshint({
            sub: true
        }))
        .pipe(jshint.reporter('default'));
});

// Test JS
gulp.task('test', function() {
    return gulp.src('test/spec/*.js')
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('error', function(err) {
            throw err;
        });
});

// Compile JS (d3)
gulp.task('js-d3', function() {
    return rjs(_.extend({}, conf.js.rjs, {
            out: 'dataseed.js'
        }))
        .pipe(uglify({
            outSourceMap: false
        }))
        .pipe(gulp.dest(conf.js.outDir));
});

// Compile JS (Highcharts)
gulp.task('js-highcharts', function() {
    var basePath = 'views/element/',
        paths = _.object(_.map(conf.js.charts, function(module) {
            return [basePath + 'd3/' + module, basePath + 'highcharts/' + module];
        }));
    return rjs(_.extend({}, conf.js.rjs, {
            paths: paths,
            out: 'dataseed-highcharts.js'
        }))
        .pipe(uglify({
            outSourceMap: false
        }))
        .pipe(gulp.dest(conf.js.outDir));
});

// Compile LESS
gulp.task('less', function () {
    return gulp.src(conf.less.src)
        .pipe(less({
            paths: conf.less.paths
        }))
        .pipe(csso())
        .pipe(gulp.dest(conf.less.outDir));
});

// Default
gulp.task('default', ['lint', 'test', 'js-d3', 'js-highcharts', 'less']);
