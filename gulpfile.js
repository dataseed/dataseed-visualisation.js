var gulp = require('gulp'),
    _ = require('underscore'),
    jshint = require('gulp-jshint'),
    karma = require('gulp-karma'),
    rjs = require('gulp-requirejs'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    less = require('gulp-less'),
    csso = require('gulp-csso');

// Configuration
var conf = {
    js: {
        test: {
            config: 'src/js/test/karma.conf.js',
            perfConfig: 'src/js/test/karma.perf.conf.js',
            files: 'test/spec/**/*.js'
        },
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
            '!' + conf.js.rjs.baseUrl + '/components/**/*.js',
            '!' + conf.js.test.config,
            '!' + conf.js.test.perfConfig
        ])
        .pipe(jshint({
            sub: true
        }))
        .pipe(jshint.reporter('default'));
});

// Test JS
gulp.task('test', function() {
    return gulp.src(conf.js.test.files)
        .pipe(karma({
            configFile: conf.js.test.config,
            action: 'run'
        }))
        .on('error', function(err) {
            throw err;
        });
});

// Test JS (watch)
gulp.task('watch', function() {
    return gulp.src(conf.js.test.files)
        .pipe(karma({
            configFile: conf.js.test.config,
            action: 'watch',
            logLevel: 'debug'
        }));
});

// Performance Test JS
gulp.task('test-perf', function() {
    return gulp.src(conf.js.test.files)
        .pipe(karma({
            configFile: conf.js.test.perfConfig,
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
        .pipe(replace(/\s+/g, ' '))
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
        .pipe(replace(/\s+/g, ' '))
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
