/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

module.exports = function(grunt) {
    grunt.initConfig({
        jsbeautifier: {
            files: ['bin/*.js', 'lib/**/*.js', 'test/**/*.js', '*.js'],
            options: {
                config: '.jsbeautifyrc'
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.registerTask('format', ['jsbeautifier']);
};
