/*
* Copyright 2013 Eduardo Lundgren, All Rights Reserved.
*
* Code licensed under the BSD License:
* https://github.com/eduardolundgren/blob/master/LICENSE.md
*
* @author Eduardo Lundgren <eduardolundgren@gmail.com>
*/

var base = require('./base'),
    fs = require('fs'),
    git = require('git-wrapper'),
    path = require('path'),
    prompt = require('cli-prompt');

exports.git = new git();

exports.exec = function() {
    exports.git.exec.apply(exports.git, arguments);
};

exports.findRoot = function(opt_callback) {
    exports.exec('rev-parse', ['--show-toplevel'], function(err, data) {
        opt_callback(err, data.trim());
    });
};

exports.getCurrentBranch = function(opt_callback) {
    exports.exec('symbolic-ref', ['HEAD'], function(err, data) {
        data = data.substring(data.lastIndexOf('/') + 1);
        opt_callback(err, data.trim());
    });
};

exports.getOriginURL = function(opt_callback) {
    exports.exec('config', ['--get', 'remote.origin.url'], function(err, data) {
        opt_callback(err, data.trim());
    });
};

exports.getRepositoryName = function(opt_callback) {
    var end,
        gitLastIndex;

    exports.getOriginURL(function(err, data) {
        gitLastIndex = data.lastIndexOf('.git');
        end = (gitLastIndex > -1) ? gitLastIndex : data.length;

        data = data.substring(data.lastIndexOf('/') + 1, gitLastIndex);

        opt_callback(err, data);
    });
};