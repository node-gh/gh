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
                src: [
                  'bin/*.js',
                  'lib/**/*.js'
                ]
            },
            test: {
                options: {
                    globals: {
                        describe: true,
                        it: true,
                        beforeEach: true,
                        afterEach: true,
                        before: true,
                        after: true
                    }
                },
                src: 'test/**/*.js'
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.registerTask('format', ['jsbeautifier']);
};
