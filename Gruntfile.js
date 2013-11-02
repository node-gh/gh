/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <zno.rocha@gmail.com>
 */

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
            files: {
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
                '<%= jshint.files.src %>',
                '<%= jshint.test.src %>'
            ],
            tasks: ['jshint', 'mochaTest']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('default', ['jshint', 'mochaTest']);
    grunt.registerTask('format', ['jsbeautifier']);
    grunt.registerTask('travis', ['jshint', 'mochaTest']);
};