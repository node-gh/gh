/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict';

var configs = require('./configs'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path'),
    updateNotifier = require('update-notifier');

exports.clone = function(o) {
    return JSON.parse(JSON.stringify(o));
};

// -- Utils --------------------------------------------------------------------

exports.checkVersion = function(opt_callback) {
    var notifier,
        packagesPath = ['../package'],
        plugins = configs.getPlugins();

    plugins.forEach(function(plugin) {
        packagesPath.push(
            path.join(configs.getNodeModulesGlobalPath(), plugin, 'package'));
    });

    packagesPath.forEach(function(path) {
        var pkg = require(path);

        notifier = updateNotifier({
            packageName: pkg.name,
            packageVersion: pkg.version
        });

        if (notifier.update) {
            notifier.notify();
        }
    });

    opt_callback && opt_callback();
};

exports.expandAliases = function(options) {
    var config = configs.getConfig();

    if (config.alias) {
        options.fwd = config.alias[options.fwd] || options.fwd;
        options.submit = config.alias[options.submit] || options.submit;
        options.user = config.alias[options.user] || options.user;
    }
};

exports.find = function(filepath, opt_pattern) {
    return fs.readdirSync(filepath).filter(function(file) {
        return (opt_pattern || /.*/).test(file);
    });
};

exports.getDuration = function(start, opt_end) {
    if (opt_end === undefined) {
        opt_end = Date.now();
    }

    return moment.duration(moment(start).diff(opt_end)).humanize(true);
};

exports.getUser = function() {
    return configs.getConfig().github_user;
};

// Export the config so plugins can access it
exports.getConfig = configs.getConfig;
