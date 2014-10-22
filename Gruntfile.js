/*
 * angular-ztiles
 *
 * Copyright(c) 2014 Patrick Zimmermann <patrick@knowhere.guru>
 * MIT Licensed
 *
 */

/**
 * @author Patrick Zimmermann <patrick@knowhere.guru>
 *
 */

'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  var banner = '/*! <%= pkg.name %> (v<%= pkg.version %>) - ' +
    'Copyright: 2014, <%= pkg.author %> - <%= pkg.license %> */\n';

  grunt.initConfig({
    pkg: grunt.file.readJSON('bower.json'),
    uglify: {
      options: {
        preserveComments: 'some',
        report: 'gzip',
        mangle: false,
        compress: {
          drop_console: true,
          angular: true
        }
      },
      dist: {
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
      }
    },
    concat: {
      options: {
        banner: banner
      },
      dist: {
        src: ['src/ztiles.js'],
        dest: '<%= pkg.name %>.js'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        //'Gruntfile.js',
        'karma.config.js',
        'src/*.js',
        'example/*.js',
        'specs/*.js'
      ]
    },
    jscs: {
      src: [
        //'Gruntfile.js',
        'karma.config.js',
        'src/*.js',
        'example/*.js',
        'specs/*.js'
      ],
      options: {
        config: '.jscsrc',
        reporter: require('jscs-stylish').path
      }
    },
    ngmin: {
      dist: {
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.js'
      }
    },
    karma: {
      dist: {
        configFile: 'karma.config.js'
      },
      watch: {
        configFile: 'karma.config.js',
        singleRun: false,
        autoWatch: true
      }
    }
  });

  grunt.registerTask('test', ['jshint', 'jscs', 'karma:dist']);
  grunt.registerTask('default', ['test', 'concat', 'uglify']);
  grunt.registerTask('testing', ['jshint', 'jscs', 'karma:watch']);
};
