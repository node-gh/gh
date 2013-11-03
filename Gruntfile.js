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
            tasks: ['jshint', 'mochaTest']
        }
    });

    // Load all Grunt tasks installed from NPM
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('default', ['jshint', 'mochaTest']);
    grunt.registerTask('format', ['jsbeautifier']);
    grunt.registerTask('travis', ['jshint', 'mochaTest']);

};
