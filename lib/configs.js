"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const userhome = require("userhome");
const which = require("which");
const exec = require("./exec");
const logger = require("./logger");
let cache = {};
let plugins;
exports.PLUGINS_PATH_KEY = 'plugins_path';
// -- Config -------------------------------------------------------------------
function getNodeModulesGlobalPath() {
    let result;
    let path = getConfig()[exports.PLUGINS_PATH_KEY];
    if (path === undefined) {
        result = exec.spawnSync('npm', ['root', '-g']);
        if (result.stdout) {
            path = result.stdout;
            process.env.NODE_ENV !== 'testing' && writeGlobalConfig(exports.PLUGINS_PATH_KEY, path);
        }
        else {
            logger.warn("Can't resolve plugins directory path.");
        }
    }
    return path;
}
exports.getNodeModulesGlobalPath = getNodeModulesGlobalPath;
function getProjectConfigPath() {
    return path.join(process.cwd(), '.gh.json');
}
exports.getProjectConfigPath = getProjectConfigPath;
function getUserHomePath() {
    return process.env.NODE_ENV === 'testing' ? '../default.gh.json' : userhome('.gh.json');
}
exports.getUserHomePath = getUserHomePath;
function resolveGhConfigs(opt_plugin) {
    const globalConfig = getGlobalConfig(opt_plugin);
    let projectConfig;
    const result = {};
    try {
        projectConfig = JSON.parse(fs.readFileSync(getProjectConfigPath()).toString());
        Object.keys(globalConfig).forEach(key => {
            result[key] = globalConfig[key];
        });
        Object.keys(projectConfig).forEach(key => {
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
function getConfig(opt_plugin) {
    let config = cache[opt_plugin];
    if (!config) {
        config = resolveGhConfigs(opt_plugin);
        cache[opt_plugin] = config;
    }
    const protocol = `${config.api.protocol}://`;
    const is_enterprise = config.api.host !== 'api.github.com';
    if (config.github_host === undefined) {
        config.github_host = `${protocol}${is_enterprise ? config.api.host : 'github.com'}/`;
    }
    if (config.github_gist_host === undefined) {
        config.github_gist_host = `${protocol}${is_enterprise ? `${config.api.host}/gist` : 'gist.github.com'}/`;
    }
    return config;
}
exports.getConfig = getConfig;
function getGlobalConfig(opt_plugin) {
    let defaultConfig;
    let configPath;
    let userConfig;
    configPath = getUserHomePath();
    if (!fs.existsSync(configPath)) {
        createGlobalConfig();
    }
    defaultConfig = JSON.parse(fs.readFileSync(getGlobalConfigPath()).toString());
    userConfig = JSON.parse(fs.readFileSync(configPath).toString());
    Object.keys(userConfig).forEach(key => {
        defaultConfig[key] = userConfig[key];
    });
    if (opt_plugin) {
        getPlugins().forEach(plugin => {
            addPluginConfig(defaultConfig, plugin);
        });
    }
    return defaultConfig;
}
exports.getGlobalConfig = getGlobalConfig;
function getGlobalConfigPath() {
    return path.join(__dirname, '../default.gh.json');
}
exports.getGlobalConfigPath = getGlobalConfigPath;
function removeGlobalConfig(key) {
    var config = getGlobalConfig();
    delete config[key];
    saveJsonConfig(getUserHomePath(), config);
    cache = {};
}
exports.removeGlobalConfig = removeGlobalConfig;
function createGlobalConfig() {
    saveJsonConfig(getUserHomePath(), JSON.parse(fs.readFileSync(getGlobalConfigPath()).toString()));
    cache = {};
}
exports.createGlobalConfig = createGlobalConfig;
function writeGlobalConfig(jsonPath, value) {
    const config = getGlobalConfig();
    let i;
    let output;
    let path;
    let pathLen;
    path = jsonPath.split('.');
    output = config;
    for (i = 0, pathLen = path.length; i < pathLen; i++) {
        output[path[i]] = config[path[i]] || (i + 1 === pathLen ? value : {});
        output = output[path[i]];
    }
    saveJsonConfig(getUserHomePath(), config);
    cache = {};
}
exports.writeGlobalConfig = writeGlobalConfig;
function saveJsonConfig(path, object) {
    const options = {
        mode: parseInt('0600', 8),
    };
    fs.writeFileSync(path, JSON.stringify(object, null, 4), options);
}
exports.saveJsonConfig = saveJsonConfig;
function writeGlobalConfigCredentials(user, token) {
    const configPath = getUserHomePath();
    writeGlobalConfig('github_user', user);
    writeGlobalConfig('github_token', token);
    logger.log(`Writing GH config data: ${configPath}`);
}
exports.writeGlobalConfigCredentials = writeGlobalConfigCredentials;
// -- Plugins ------------------------------------------------------------------
function addPluginConfig(config, plugin) {
    let pluginConfig;
    let userConfig;
    try {
        // Always use the plugin name without prefix. To be safe removing "gh-"
        // prefix from passed plugin.
        plugin = getPluginBasename(plugin || process.env.NODEGH_PLUGIN);
        pluginConfig = require(path.join(getNodeModulesGlobalPath(), `gh-${plugin}`, 'gh-plugin.json'));
        // Merge default plugin configuration with the user's.
        userConfig = config.plugins[plugin] || {};
        Object.keys(userConfig).forEach(key => {
            pluginConfig[key] = userConfig[key];
        });
        config.plugins[plugin] = pluginConfig;
    }
    catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
            throw e;
        }
    }
}
exports.addPluginConfig = addPluginConfig;
function resolvePlugins() {
    var pluginsPath = getNodeModulesGlobalPath();
    if (pluginsPath === '') {
        return [];
    }
    try {
        plugins = fs.readdirSync(pluginsPath).filter(plugin => {
            return plugin.substring(0, 3) === 'gh-';
        });
    }
    catch (e) {
        plugins = [];
        logger.warn("Can't read plugins directory.");
    }
    finally {
        return plugins;
    }
}
function getPlugins() {
    if (!plugins) {
        plugins = resolvePlugins();
    }
    return plugins;
}
exports.getPlugins = getPlugins;
function getPlugin(plugin) {
    plugin = getPluginBasename(plugin);
    return require(getPluginPath(`gh-${plugin}`));
}
exports.getPlugin = getPlugin;
function getPluginPath(plugin) {
    return fs.realpathSync(which.sync(plugin));
}
exports.getPluginPath = getPluginPath;
function getPluginBasename(plugin) {
    return plugin && plugin.replace('gh-', '');
}
exports.getPluginBasename = getPluginBasename;
function isPluginIgnored(plugin) {
    if (getConfig().ignored_plugins.indexOf(getPluginBasename(plugin)) > -1) {
        return true;
    }
    return false;
}
exports.isPluginIgnored = isPluginIgnored;
