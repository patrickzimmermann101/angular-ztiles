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

module.exports = function (grunt) {

    var banner = '/*! <%= pkg.name %> (v<%= pkg.version %>) - Copyright: 2014, <%= pkg.author %> - <%= pkg.license %> */\n';

    grunt.initConfig({
        pkg: grunt.file.readJSON('bower.json'),
        uglify: {
            options: {
                preserveComments: 'some',
                report: 'gzip',
                mangle: false,
                compress: {
                     drop_console: true
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
                'src/*.js',
                'example/*.js'
            ]
        },
        jscs: {
            src: [
                'src/*.js',
                'example/*.js'
            ],
            options: {
                config: '.jscsrc',
                reporter: require( 'jscs-stylish' ).path
            }
        },
        ngmin: {
            dist: {
                src: '<%= pkg.name %>.js',
                dest: '<%= pkg.name %>.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks("grunt-jscs");
    
    grunt.registerTask('test', ['jshint', 'jscs']);
    grunt.registerTask('default', ['test', 'concat', 'uglify']);
};
