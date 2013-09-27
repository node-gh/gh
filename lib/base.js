/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

var fs = require('fs'),
    moment = require('moment'),
    github = require('github'),
    logger = require('./logger'),
    path = require('path'),
    updateNotifier = require('update-notifier'),
    userhome = require('userhome');

exports.github = new github({
    version: '3.0.0',
    debug: false
});

exports.checkVersion = function(opt_callback) {
    var notifier,
        packagesPath = ['../package'],
        plugins = exports.getPlugins();

    plugins.forEach(function(plugin) {
        packagesPath.push(path.join(exports.getPluginsPath(), plugin, 'package'));
    });

    packagesPath.forEach(function(path) {
        notifier = updateNotifier({
            packagePath: path,
            updateCheckInterval: 1000 * 60 * 60 * 24 // 1 day
        });

        if (notifier.update) {
            notifier.notify();
        }
    });

    opt_callback && opt_callback();
};

exports.clone = function(o) {
    var i, c = {};

    for (i in o) {
        if (o.hasOwnProperty(i)) {
            c[i] = o[i];
        }
    }

    return c;
};

exports.find = function(filepath, opt_pattern) {
    return fs.readdirSync(filepath).filter(function(file) {
        return (opt_pattern || /.*/).test(file);
    });
};

exports.getConfigPath = function() {
    return path.join(__dirname, '../', '.gh.json');
};

exports.getDuration = function(start, opt_end) {
    if (opt_end === undefined) {
        opt_end = Date.now();
    }

    return moment.duration(moment(opt_end).diff(start)).humanize(true);
};

exports.getGlobalConfig = function() {
    var configPath,
        config,
        userConfig;

    configPath = exports.getGlobalConfigPath();

    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '{}');
    }

    try {
        config = require(exports.getConfigPath());
        userConfig = require(configPath);

        Object.keys(userConfig).forEach(function(value) {
            config[value] = userConfig[value];
        });

        return config;
    }
    catch (err) {
        return {};
    }
};

exports.getGlobalConfigPath = function() {
    return userhome('.gh.json');
};

exports.getPlugins = function() {
    var nodeModulesPath = exports.getPluginsPath(),
        plugins;

    plugins = fs.readdirSync(nodeModulesPath).filter(function(plugin) {
        return plugin.substring(0, 3) === 'gh-';
    });

    return plugins;
};

exports.getPluginsPath = function() {
    return path.join(process.execPath, '/../../lib/node_modules');
};

exports.getUser = function() {
    var config = exports.getGlobalConfig();

    return config.github_user;
};

exports.getUserHomePath = function() {
    return userhome('.gh.json');
};

exports.removeGlobalConfig = function(key) {
    var config = exports.getGlobalConfig();

    delete config[key];

    fs.writeFileSync(
        exports.getUserHomePath(),
        JSON.stringify(config, null, 4)
    );
};

exports.writeGlobalConfig = function(jsonPath, value) {
    var config = exports.getGlobalConfig(),
        i,
        output,
        path,
        pathLen;

    path = jsonPath.split('.');
    output = config;

    for (i = 0, pathLen = path.length; i < pathLen; i++) {
        output[path[i]] = config[path[i]] || (i + 1 === pathLen ? value : {});
        output = output[path[i]];
    }

    fs.writeFileSync(
        exports.getUserHomePath(),
        JSON.stringify(config, null, 4)
    );
};

exports.writeGlobalConfigCredentials = function(user, token) {
    var configPath = exports.getUserHomePath();

    exports.writeGlobalConfig('github_user', user);
    exports.writeGlobalConfig('github_token', token);
    logger.success('Writing GH config data: ' + configPath);
};