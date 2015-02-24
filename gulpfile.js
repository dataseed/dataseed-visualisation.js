var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    karma = require('gulp-karma'),
    rjs = require('gulp-requirejs'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    less = require('gulp-less'),
    csso = require('gulp-csso'),
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
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
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

// Build JS
gulp.task('js', ['lint', 'test'], function() {
    return rjs({
            baseUrl: 'src/js',
            mainConfigFile: 'src/js/config.js',
            name: 'components/almond/almond',
            include: ['app'],
            insertRequire: ['app'],
            almond: true,
            inlineText: true,
            preserveLicenseComments: false,
            out: 'dataseed.js'
        })
        .pipe(uglify({outSourceMap: false}))
        .pipe(replace(/\s+/g, ' '))
        .pipe(gulp.dest('dist/js/'));
});

// Compile LESS
gulp.task('less', ['lint', 'test'], function () {
    return gulp.src('src/less/dataseed.less')
        .pipe(less({paths: ['src/less/']}))
        .pipe(csso())
        .pipe(gulp.dest('dist/css/'));
});

// Default
gulp.task('default', ['js', 'less']);
