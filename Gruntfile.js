/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <eduardo.lundgren@gmail.com>
 */

'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        bump: {
            options: {
                commit: true,
                commitFiles: ['package.json'],
                commitMessage: 'Release v%VERSION%',
                createTag: true,
                files: ['package.json'],
                push: true,
                pushTo: 'origin',
                tagMessage: '',
                tagName: 'v%VERSION%'
            }
        },

        jsbeautifier: {
            files: ['bin/*.js', 'lib/**/*.js', 'test/**/*.js', '*.js'],
            options: {
                config: '.jsbeautifyrc'
            }
        },

        jshint: {
            gruntfile: 'Gruntfile.js',
            lib: {
                src: ['bin/*.js', 'lib/**/*.js']
            },
            options: grunt.file.readJSON('.jshintrc'),
            test: {
                options: grunt.file.readJSON('test/.jshintrc'),
                src: ['test/**/*.js']
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    slow: 1500,
                    timeout: 50000
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
