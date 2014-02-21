var gulp = require('gulp'),
    _ = require('underscore'),
    jshint = require('gulp-jshint'),
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
            name: '../components/almond/almond',
            include: ['app'],
            insertRequire: ['app'],
            almond: true,
            inlineText: true,
            preserveLicenseComments: false
        },
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
    return gulp.src(conf.js.rjs.baseUrl + '/**/*.js')
        .pipe(jshint({
            sub: true
        }))
        .pipe(jshint.reporter('default'));
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
    return rjs(_.extend({}, conf.js.rjs, {
            paths: {
                'views/element/d3/chart': 'views/element/highcharts/chart',
                'views/element/d3/bar': 'views/element/highcharts/bar',
                'views/element/d3/bubble': 'views/element/highcharts/bubble',
                'views/element/d3/geo': 'views/element/highcharts/geo',
                'views/element/d3/line': 'views/element/highcharts/line',
                'views/element/d3/table': 'views/element/highcharts/table',
            },
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
gulp.task('default', ['lint', 'js-d3', 'js-highcharts', 'less']);
