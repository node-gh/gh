/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

'use strict';

var fs = require('fs'),
    moment = require('moment'),
    github = require('github'),
    logger = require('./logger'),
    path = require('path'),
    updateNotifier = require('update-notifier'),
    userhome = require('userhome'),
    which = require('which');

// -- Constants ----------------------------------------------------------------

exports.TIME_DAY = 1000 * 60 * 60 * 24;

// -- Config -------------------------------------------------------------------

exports.addPluginConfig = function(config, plugin) {
    var pluginConfig,
        userConfig;

    try {
        // Always use the plugin name without prefix. To be safe removing "gh-"
        // prefix from passed plugin.
        plugin = exports.getPluginBasename(plugin || process.env.NODEGH_PLUGIN);

        pluginConfig = require(path.join(
            exports.getNodeModulesGlobalPath(), 'gh-' + plugin, '.gh.json'));

        // Merge default plugin configuration with the user's.
        userConfig = config.plugins[plugin] || {};

        Object.keys(userConfig).forEach(function(key) {
            pluginConfig[key] = userConfig[key];
        });

        config.plugins[plugin] = pluginConfig;
    }
    catch (e) {}
};

exports.clone = function(o) {
    return JSON.parse(JSON.stringify(o));
};

exports.getConfig = function(opt_plugin) {
    var config,
        configPath,
        userConfig;

    configPath = exports.getUserHomePath();

    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '{}');
    }

    try {
        config = require(exports.getConfigPath());
        userConfig = require(configPath);

        Object.keys(userConfig).forEach(function(key) {
            config[key] = userConfig[key];
        });

        if (opt_plugin) {
            exports.getPlugins().forEach(function(plugin) {
                exports.addPluginConfig(config, plugin);
            });
        }

        return config;
    }
    catch (err) {
        return {};
    }
};

exports.getConfigPath = function() {
    return path.join(__dirname, '../', '.gh.json');
};

exports.getUserHomePath = function() {
    return userhome('.gh.json');
};

exports.removeGlobalConfig = function(key) {
    var config = exports.getConfig();

    delete config[key];

    fs.writeFileSync(
        exports.getUserHomePath(),
        JSON.stringify(config, null, 4)
    );
};

exports.writeGlobalConfig = function(jsonPath, value) {
    var config = exports.getConfig(),
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

// -- Utils --------------------------------------------------------------------

var baseConfig = exports.getConfig();

exports.github = new github({
    debug: false,
    host: baseConfig.api.host,
    protocol: baseConfig.api.protocol,
    version: baseConfig.api.version
});

exports.checkVersion = function(opt_callback) {
    var notifier,
        packagesPath = ['../package'],
        plugins = exports.getPlugins();

    plugins.forEach(function(plugin) {
        packagesPath.push(
            path.join(exports.getNodeModulesGlobalPath(), plugin, 'package'));
    });

    packagesPath.forEach(function(path) {
        notifier = updateNotifier({
            packagePath: path,
            updateCheckInterval: exports.TIME_DAY
        });

        if (notifier.update) {
            notifier.notify();
        }
    });

    opt_callback && opt_callback();
};

exports.expandAliases = function(options) {
    var config = exports.getConfig();

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

    return moment.duration(moment(opt_end).diff(start)).humanize(true);
};

exports.getNodeModulesGlobalPath = function() {
    return path.join(process.execPath, '/../../lib/node_modules');
};

exports.getUser = function() {
    return exports.getConfig().github_user;
};

// -- Plugins ------------------------------------------------------------------

exports.getPlugin = function(plugin) {
    plugin = exports.getPluginBasename(plugin);
    try {
        return require(exports.getPluginPath('gh-' + plugin));
    }
    catch (e) {}
};

exports.getPluginPath = function(plugin) {
    try {
        return which.sync(plugin);
    }
    catch (e) {}
};

exports.getPlugins = function() {
    var nodeModulesPath = exports.getNodeModulesGlobalPath(),
        plugins;

    plugins = fs.readdirSync(nodeModulesPath).filter(function(plugin) {
        return plugin.substring(0, 3) === 'gh-';
    });

    return plugins;
};

exports.getPluginBasename = function(plugin) {
    return plugin && plugin.replace('gh-', '');
};

exports.isPluginIgnored = function(plugin) {
    if (exports.getConfig().ignored_plugins.indexOf(exports.getPluginBasename(plugin)) > -1) {
        return true;
    }

    return false;
};
