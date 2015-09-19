/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict';

var async = require('async'),
    configs = require('./configs'),
    exec = require('./exec'),
    truncate = require('truncate'),
    logger = require('./logger'),
    config = configs.getConfig(true);

exports.createContext = function (scope) {
    return {
        options: scope.options,
        signature: config.signature
    };
};

exports.getHooksArrayFromPath_ = function (path, opt_config) {
    var keys = path.split('.'),
        key = keys.shift(),
        hooks;

    opt_config = opt_config || config;

    hooks = opt_config.hooks || {};

    while (hooks[key]) {
        hooks = hooks[key];
        key = keys.shift();
    }

    return Array.isArray(hooks) ? hooks : [];
};

exports.getHooksFromPath = function (path) {
    var hooks,
        plugins = configs.getPlugins(),
        pluginHooks = [];

    // First, load all core hooks for the specified path.
    hooks = exports.getHooksArrayFromPath_(path);

    // Second, search all installed plugins and load the hooks for each into
    // core hooks array.
    plugins.forEach(function (plugin) {
        var pluginConfig;

        plugin = configs.getPluginBasename(plugin);

        if (config.plugins && !configs.isPluginIgnored(plugin)) {
            pluginConfig = config.plugins[plugin];

            if (pluginConfig) {
                pluginHooks = pluginHooks.concat(
                    exports.getHooksArrayFromPath_(path, pluginConfig));
            }
        }
    });

    return hooks.concat(pluginHooks);
};

exports.invoke = function (path, scope, opt_callback) {
    var after = exports.getHooksFromPath(path + '.after'),
        before = exports.getHooksFromPath(path + '.before'),
        beforeOperations,
        afterOperations,
        options = scope.options,
        context;

    if (options.hooks === false || process.env.NODEGH_HOOK_IS_LOCKED) {
        opt_callback && opt_callback();
        return;
    }

    context = exports.createContext(scope);

    beforeOperations = [

        function (callback) {
            exports.setupPlugins_(context, 'setupBeforeHooks', callback);
        }
    ];

    before.forEach(function (cmd) {
        beforeOperations.push(exports.wrapCommand_(cmd, context, 'before'));
    });

    afterOperations = [

        function (callback) {
            exports.setupPlugins_(context, 'setupAfterHooks', callback);
        }
    ];

    after.forEach(function (cmd) {
        afterOperations.push(exports.wrapCommand_(cmd, context, 'after'));
    });

    afterOperations.push(function (callback) {
        process.env.NODEGH_HOOK_IS_LOCKED = false;
        callback();
    });

    process.env.NODEGH_HOOK_IS_LOCKED = true;

    async.series(beforeOperations, function () {
        opt_callback && opt_callback(function () {
            async.series(afterOperations);
        });
    });
};

exports.setupPlugins_ = function (context, setupFn, opt_callback) {
    var plugins = configs.getPlugins(),
        operations = [];

    plugins.forEach(function (plugin) {
        try {
            plugin = configs.getPlugin(plugin);
        }
        catch(e) {
            logger.warn('Can\'t get ' + plugin + ' plugin.');
        }

        if (plugin && plugin[setupFn]) {
            operations.push(function (callback) {
                plugin[setupFn](context, callback);
            });
        }
    });

    async.series(operations, function () {
        opt_callback && opt_callback();
    });
};

exports.wrapCommand_ = function (cmd, context, when) {
    return function (callback) {
        var raw = logger.compileTemplate(cmd, context);

        if (!raw) {
            callback && callback();
            return;
        }

        logger.log(logger.colors.cyan('[hook]'), truncate(raw.trim(), 120));

        try {
            exec.execSyncInteractiveStream(raw, {cwd: process.cwd()});
        } catch(e) {
            logger.debug('[' + when + ' hook failure]');
        } finally {
            logger.debug(logger.colors.cyan('[end of ' + when + ' hook]'));
        }

        callback && callback();
    };
};
