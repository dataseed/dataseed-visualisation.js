var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    rjs = require('gulp-requirejs'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    csso = require('gulp-csso');

// Lint JS
gulp.task('lint', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(jshint({
            sub: true
        }))
        .pipe(jshint.reporter('default'));
});

// Compile JS
gulp.task('js', function() {
    return rjs({
            baseUrl: 'src/js',
            mainConfigFile: 'src/js/config.js',
            name: '../components/almond/almond',
            almond: true,
            include: ['app'],
            insertRequire: ['app'],
            inlineText: true,
            preserveLicenseComments: false,
            out: 'dataseed.js'
        })
        .pipe(uglify({
            outSourceMap: false
        }))
        .pipe(gulp.dest('dist/js/'));
});

// Compile LESS
gulp.task('less', function () {
    return gulp.src('src/less/dataseed.less')
        .pipe(less({
            paths: ['src/less/']
        }))
        .pipe(csso())
        .pipe(gulp.dest('dist/css/'));
});

// Default
gulp.task('default', ['lint', 'js', 'less']);
