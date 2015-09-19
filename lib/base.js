/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict';

var configs = require('./configs'),
    fs = require('fs'),
    Github = require('github'),
    path = require('path'),
    tracker = require('./tracker'),
    updateNotifier = require('update-notifier');

// -- Config -------------------------------------------------------------------

exports.clone = function (o) {
    return JSON.parse(JSON.stringify(o));
};

// -- Utils --------------------------------------------------------------------

exports.load = function () {
    var config = configs.getConfig();

    exports.github = new Github({
        debug: false,
        host: config.api.host,
        protocol: config.api.protocol,
        version: config.api.version,
        pathPrefix: config.api.pathPrefix
    });
};

exports.asyncReadPackages = function (callback) {
    function async(err, data) {
        if (err) {
            throw err;
        }

        callback(JSON.parse(data));
    }

    fs.readFile(path.join(__dirname, '..', 'package.json'), async);

    configs.getPlugins().forEach(function (plugin) {
        fs.readFile(path.join(
            configs.getNodeModulesGlobalPath(), plugin, 'package.json'), async);
    });
};

exports.notifyVersion = function (pkg) {
    var notifier = updateNotifier({pkg: pkg}),
        update,
        track = 'notify/';

    if (notifier.update) {
        update = notifier.update;

        track += update.name + '/' + update.latest + '/from/' + update.current;

        tracker.track(track);

        notifier.notify();
    }
};

exports.checkVersion = function () {
    exports.asyncReadPackages(exports.notifyVersion);
};

exports.expandAliases = function (options) {
    var config = configs.getConfig();

    if (config.alias) {
        options.fwd = config.alias[options.fwd] || options.fwd;
        options.submit = config.alias[options.submit] || options.submit;
        options.user = config.alias[options.user] || options.user;
    }
};

exports.find = function (filepath, opt_pattern) {
    return fs.readdirSync(filepath).filter(function (file) {
        return (opt_pattern || /.*/).test(file);
    });
};

exports.getUser = function () {
    return configs.getConfig().github_user;
};

// Export some config methods to allow plugins to access them
exports.getConfig = configs.getConfig;
exports.writeGlobalConfig = configs.writeGlobalConfig;
