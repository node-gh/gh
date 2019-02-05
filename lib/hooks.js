"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
const async = require("async");
const lodash_1 = require("lodash");
const truncate = require("truncate");
const configs = require("./configs");
const exec = require("./exec");
const logger = require("./logger");
const config = configs.getConfig();
function createContext(scope) {
    return {
        options: scope.options,
        signature: config.signature,
    };
}
exports.createContext = createContext;
function getHooksArrayFromPath_(path, opt_config) {
    const keys = path.split('.');
    let key = keys.shift();
    let hooks;
    opt_config = opt_config || config;
    hooks = opt_config.hooks || {};
    while (hooks[key]) {
        hooks = hooks[key];
        key = keys.shift();
    }
    return Array.isArray(hooks) ? hooks : [];
}
exports.getHooksArrayFromPath_ = getHooksArrayFromPath_;
function getHooksFromPath(path) {
    const plugins = configs.getPlugins();
    let pluginHooks = [];
    // First, load all core hooks for the specified path.
    const hooks = getHooksArrayFromPath_(path);
    // Second, search all installed plugins and load the hooks for each into
    // core hooks array.
    process.env.NODE_ENV !== 'testing' &&
        plugins.forEach(plugin => {
            var pluginConfig;
            plugin = configs.getPluginBasename(plugin);
            if (config.plugins && !configs.isPluginIgnored(plugin)) {
                pluginConfig = config.plugins[plugin];
                if (pluginConfig) {
                    pluginHooks = pluginHooks.concat(getHooksArrayFromPath_(path, pluginConfig));
                }
            }
        });
    return hooks.concat(pluginHooks);
}
exports.getHooksFromPath = getHooksFromPath;
function invoke(path, scope, opt_callback) {
    const after = getHooksFromPath(`${path}.after`);
    const before = getHooksFromPath(`${path}.before`);
    let beforeOperations;
    let afterOperations;
    const options = scope.options;
    let context;
    if (options.hooks === false || process.env.NODEGH_HOOK_IS_LOCKED) {
        opt_callback && opt_callback(lodash_1.noop);
        return;
    }
    context = createContext(scope);
    beforeOperations = [
        function (callback) {
            setupPlugins_(context, 'setupBeforeHooks', callback);
        },
    ];
    before.forEach(cmd => {
        beforeOperations.push(wrapCommand_(cmd, context, 'before'));
    });
    afterOperations = [
        function (callback) {
            setupPlugins_(context, 'setupAfterHooks', callback);
        },
    ];
    after.forEach(cmd => {
        afterOperations.push(wrapCommand_(cmd, context, 'after'));
    });
    afterOperations.push(callback => {
        process.env.NODEGH_HOOK_IS_LOCKED = 'false';
        callback();
    });
    process.env.NODEGH_HOOK_IS_LOCKED = 'true';
    async.series(beforeOperations, () => {
        opt_callback &&
            opt_callback(() => {
                async.series(afterOperations);
            });
    });
}
exports.invoke = invoke;
function setupPlugins_(context, setupFn, opt_callback) {
    const plugins = configs.getPlugins();
    const operations = [];
    plugins.forEach(plugin => {
        try {
            plugin = configs.getPlugin(plugin);
        }
        catch (e) {
            logger.warn(`Can't get ${plugin} plugin.`);
        }
        if (plugin && plugin[setupFn]) {
            operations.push(callback => {
                plugin[setupFn](context, callback);
            });
        }
    });
    async.series(operations, () => {
        opt_callback && opt_callback();
    });
}
exports.setupPlugins_ = setupPlugins_;
function wrapCommand_(cmd, context, when) {
    return function (callback) {
        var raw = logger.compileTemplate(cmd, context);
        if (!raw) {
            callback && callback();
            return;
        }
        logger.log(logger.colors.cyan('[hook]'), truncate(raw.trim(), 120));
        try {
            exec.execSyncInteractiveStream(raw, { cwd: process.cwd() });
        }
        catch (e) {
            logger.debug(`[${when} hook failure]`);
        }
        finally {
            logger.debug(logger.colors.cyan(`[end of ${when} hook]`));
        }
        callback && callback();
    };
}
exports.wrapCommand_ = wrapCommand_;
