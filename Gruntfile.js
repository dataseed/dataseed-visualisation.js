module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // ==========================================================================
  // Project configuration
  // ==========================================================================

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      compile: {
        options: {
          baseUrl: 'src/js',
          name: '../components/almond/almond',
          almond: true,
          include: ['app'],
          insertRequire: ['app'],
          mainConfigFile: 'src/js/config.js',
          optimize: 'uglify',
          inlineText: true,
          preserveLicenseComments: false,
          out: 'dist/js/dataseed.js'
        }
      }
    },
    jshint: {
      all: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          src: [
            'src/js/dataseed/**/*.js'
          ]
        }
      }
    },
    less: {
      development: {
        options: {
          yuicompress: true
        },
        files: {
          'dist/css/dataseed.css': 'src/less/dataseed.less'
        }
      }
    }
  });

  grunt.registerTask('build', ['jshint', 'requirejs', 'less']);
  grunt.registerTask('default', ['build']);

};
