/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict';

var fs = require('fs'),
    logger = require('./logger'),
    exec = require('./exec'),
    path = require('path'),
    userhome = require('userhome'),
    which = require('which'),
    cache = {},
    plugins,
    PLUGINS_PATH_KEY = 'plugins_path';

// -- Config -------------------------------------------------------------------

exports.getNodeModulesGlobalPath = function () {
    var result,
        path = exports.getConfig()[PLUGINS_PATH_KEY];

    if (path === undefined) {
        result = exec.spawnSync('npm', ['root', '-g']);

        if (result.stdout) {
            path = result.stdout;
            exports.writeGlobalConfig(PLUGINS_PATH_KEY, path);
        }
        else {
            logger.warn('Can\'t resolve plugins directory path.');
        }
    }

    return path;
};

exports.getUserHomePath = function () {
    return userhome('.gh.json');
};

function getConfig(opt_plugin) {
    var globalConfig = exports.getGlobalConfig(opt_plugin),
        projectConfig,
        result = {};

    try {
        projectConfig = JSON.parse(fs.readFileSync(exports.getProjectConfigPath()));

        Object.keys(globalConfig).forEach(function (key) {
            result[key] = globalConfig[key];
        });

        Object.keys(projectConfig).forEach(function (key) {
            result[key] = projectConfig[key];
        });

        return result;
    }
    catch (e) {
        logger.debug(e.message);

        if (e.code !== 'MODULE_NOT_FOUND' && e.code !== 'ENOENT') {
            throw e;
        }

        return globalConfig;
    }
}

exports.getConfig = function (opt_plugin) {
    var config = cache[opt_plugin];

    if (!config) {
        config = getConfig(opt_plugin);
        cache[opt_plugin] = config;
    }

    return config;
};

exports.getGlobalConfig = function (opt_plugin) {
    var config,
        configPath,
        userConfig;

    configPath = exports.getUserHomePath();

    if (!fs.existsSync(configPath)) {
        exports.createGlobalConfig();
    }

    config = JSON.parse(fs.readFileSync(exports.getGlobalConfigPath()));
    userConfig = JSON.parse(fs.readFileSync(configPath));

    Object.keys(userConfig).forEach(function (key) {
        config[key] = userConfig[key];
    });

    if (opt_plugin) {
        exports.getPlugins().forEach(function (plugin) {
            exports.addPluginConfig(config, plugin);
        });
    }

    return config;
};

exports.getGlobalConfigPath = function () {
    return path.join(__dirname, '../', 'default.gh.json');
};

exports.getProjectConfigPath = function () {
    return path.join(process.cwd(), '.gh.json');
};

exports.removeGlobalConfig = function (key) {
    var config = exports.getGlobalConfig();

    delete config[key];

    exports.saveJsonConfig(exports.getUserHomePath(), config);
    cache = {};
};

exports.createGlobalConfig = function () {
    exports.saveJsonConfig(exports.getUserHomePath(),
        JSON.parse(fs.readFileSync(exports.getGlobalConfigPath()))
    );
    cache = {};
};

exports.writeGlobalConfig = function (jsonPath, value) {
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

    exports.saveJsonConfig(exports.getUserHomePath(), config);
    cache = {};
};

exports.saveJsonConfig = function (path, object) {
    var options = {
        mode: parseInt('0600', 8)
    };

    fs.writeFileSync(path, JSON.stringify(object, null, 4), options);
};

exports.writeGlobalConfigCredentials = function (user, token) {
    var configPath = exports.getUserHomePath();

    exports.writeGlobalConfig('github_user', user);
    exports.writeGlobalConfig('github_token', token);
    logger.log('Writing GH config data: ' + configPath);
};

// -- Plugins ------------------------------------------------------------------

exports.addPluginConfig = function (config, plugin) {
    var pluginConfig,
        userConfig;

    try {
        // Always use the plugin name without prefix. To be safe removing "gh-"
        // prefix from passed plugin.
        plugin = exports.getPluginBasename(plugin || process.env.NODEGH_PLUGIN);

        pluginConfig = require(path.join(
            exports.getNodeModulesGlobalPath(), 'gh-' + plugin, 'gh-plugin.json'));

        // Merge default plugin configuration with the user's.
        userConfig = config.plugins[plugin] || {};

        Object.keys(userConfig).forEach(function (key) {
            pluginConfig[key] = userConfig[key];
        });

        config.plugins[plugin] = pluginConfig;
    }
    catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
        }
    }
};

function getPlugins() {
    var pluginsPath = exports.getNodeModulesGlobalPath();

    if (pluginsPath === '') {
        return [];
    }

    try {
        plugins = fs.readdirSync(pluginsPath).filter(function (plugin) {
            return plugin.substring(0, 3) === 'gh-';
        });
    }
    catch(e) {
        plugins = [];
        logger.warn('Can\'t read plugins directory.');
    }
    finally {
        return plugins;
    }
}

exports.getPlugins = function () {
    if (!plugins) {
        plugins = getPlugins();
    }

    return plugins;
};

exports.getPlugin = function (plugin) {
    plugin = exports.getPluginBasename(plugin);

    return require(exports.getPluginPath('gh-' + plugin));
};

exports.getPluginPath = function (plugin) {
    return which.sync(plugin);
};

exports.getPluginBasename = function (plugin) {
    return plugin && plugin.replace('gh-', '');
};

exports.isPluginIgnored = function (plugin) {
    if (exports.getConfig().ignored_plugins.indexOf(exports.getPluginBasename(plugin)) > -1) {
        return true;
    }

    return false;
};

exports.PLUGINS_PATH_KEY = PLUGINS_PATH_KEY;
