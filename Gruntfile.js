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

    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.initConfig({
        jsbeautifier: {
            files: ['bin/*.js', 'lib/**/*.js', 'test/**/*.js', '*.js'],
            options: {
                config: '.jsbeautifyrc'
            }
        }
    });

    grunt.registerTask('format', ['jsbeautifier']);
};
