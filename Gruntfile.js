/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <zno.rocha@gmail.com>
 */

'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        bump: {
            options: {
                files: ['package.json'],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: '',
                push: true,
                pushTo: 'origin'
            }
        },

        jsbeautifier: {
            files: ['bin/*.js', 'lib/**/*.js', 'test/**/*.js', '*.js'],
            options: {
                config: '.jsbeautifyrc'
            }
        },

        jshint: {
            options: grunt.file.readJSON('.jshintrc'),
            gruntfile: 'Gruntfile.js',
            lib: {
                src: ['bin/*.js', 'lib/**/*.js']
            },
            test: {
                options: grunt.file.readJSON('test/.jshintrc'),
                src: ['test/**/*.js']
            }
        },

        mochaTest: {
            test: {
                options: {
                    slow: 1500,
                    timeout: 50000,
                    reporter: 'spec'
                },
                src: ['test/**/*.js']
            }
        },

        watch: {
            files: [
                'Gruntfile.js',
                '<%= jshint.lib.src %>',
                '<%= jshint.test.src %>'
            ],
            tasks: ['lint', 'test']
        }
    });

    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('ci', ['lint', 'test']);
    grunt.registerTask('default', ['lint', 'test']);
    grunt.registerTask('format', ['jsbeautifier']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['mochaTest']);

};
