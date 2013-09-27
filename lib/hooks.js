/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

var async = require('async'),
    base = require('./base'),
    clc = require('cli-color'),
    exec = require('child_process').exec,
    logger = require('./logger');

exports.invoke = function(path, scope, opt_callback) {
    var after = exports.getHooksFromPath(path + '.after'),
        before = exports.getHooksFromPath(path + '.before'),
        afterOperations = [],
        beforeOperations = [],
        context;

    context = exports.createContext(scope);

    after.forEach(function(cmd) {
        afterOperations.push(exports.wrapCommand_(cmd, context));
    });

    before.forEach(function(cmd) {
        beforeOperations.push(exports.wrapCommand_(cmd, context));
    });

    async.series(beforeOperations, function() {
        opt_callback && opt_callback(function() {
            async.series(afterOperations);
        });
    });
};

exports.createContext = function(scope) {
    var config = base.getGlobalConfig();

    return {
        options: scope.options,
        signature: config.signature
    };
};

exports.getHooksArrayFromPath_ = function(path, opt_config) {
    var keys = path.split('.'),
        key = keys.shift(),
        hooks;

    opt_config = opt_config || base.getGlobalConfig();

    hooks = opt_config.hooks || {};

    while (hooks[key]) {
        hooks = hooks[key];
        key = keys.shift();
    }

    return Array.isArray(hooks) ? hooks : [];
};

exports.getHooksFromPath = function(path) {
    var hooks,
        plugins = base.getPlugins(),
        pluginHooks = [];

    // First, load all core hooks for the specified path.
    hooks = exports.getHooksArrayFromPath_(path);

    // Second, search all installed plugins and load the hooks for each into
    // core hooks array.
    plugins.forEach(function(plugin) {
        var config = base.getPluginConfig(plugin),
            pluginConfig;

        if (config.plugins && !base.isPluginIgnored(plugin)) {
            pluginConfig = config.plugins.jira;

            if (pluginConfig) {
                pluginHooks = pluginHooks.concat(
                    exports.getHooksArrayFromPath_(path, pluginConfig));
            }
        }
    });

    return hooks.concat(pluginHooks);
};

exports.exec_ = function(cmd, cwd, log, callback) {
    exec(cmd, {
            cwd: cwd,
            stdio: 'inherit'
        },
        function(error, stdout) {
            if (log) {
                logger.log(stdout);
            }

            if (error) {
                logger.custom('[error]', clc.redBright, logger.getErrorMessage(error));
            }
            callback();
        });
};

exports.wrapCommand_ = function(cmd, context) {
    return function(callback) {
        var raw = cmd,
            log = false;

        if (typeof raw === 'object') {
            raw = cmd.cmd;
            log = cmd.log;
        }

        raw = logger.compileTemplate(raw, context);
        if (raw) {
            logger.log('[hook]', raw.trim());
            exports.exec_(raw, process.cwd(), log, callback);
        }
        else {
            callback && callback();
        }
    };
};
