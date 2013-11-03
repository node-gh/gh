/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

'use strict';

var async = require('async'),
    base = require('./base'),
    clc = require('cli-color'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    truncate = require('truncate'),
    logger = require('./logger'),
    config = base.getConfig(true);

exports.createContext = function(scope) {
    return {
        options: scope.options,
        signature: config.signature
    };
};

exports.exec_ = function(cmd, opt_args, opt_cwd, opt_log, callback) {
    var spawned;

    if (opt_args) {
        spawned = spawn(cmd, opt_args, {
            stdio: 'inherit'
        });

        spawned.on('close', callback);
    }
    else {
        exec(cmd, {
                cwd: opt_cwd,
                stdio: 'inherit'
            },
            function(error, stdout) {
                if (opt_log) {
                    logger.log(stdout);
                }

                if (error) {
                    logger.custom('[error]', clc.redBright, logger.getErrorMessage(error));
                }
                callback();
            });
    }
};

exports.getHooksArrayFromPath_ = function(path, opt_config) {
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

exports.getHooksFromPath = function(path) {
    var hooks,
        plugins = base.getPlugins(),
        pluginHooks = [];

    // First, load all core hooks for the specified path.
    hooks = exports.getHooksArrayFromPath_(path);

    // Second, search all installed plugins and load the hooks for each into
    // core hooks array.
    plugins.forEach(function(plugin) {
        var pluginConfig;

        plugin = base.getPluginBasename(plugin);

        if (config.plugins && !base.isPluginIgnored(plugin)) {
            pluginConfig = config.plugins[plugin];

            if (pluginConfig) {
                pluginHooks = pluginHooks.concat(
                    exports.getHooksArrayFromPath_(path, pluginConfig));
            }
        }
    });

    return hooks.concat(pluginHooks);
};

exports.invoke = function(path, scope, opt_callback) {
    var after = exports.getHooksFromPath(path + '.after'),
        before = exports.getHooksFromPath(path + '.before'),
        beforeOperations,
        afterOperations,
        context;

    if (process.env.NODEGH_HOOK_IS_LOCKED) {
        opt_callback && opt_callback();
        return;
    }

    context = exports.createContext(scope);

    beforeOperations = [
        function(callback) {
            exports.setupPlugins_(context, 'setupBeforeHooks', callback);
        }
    ];

    before.forEach(function(cmd) {
        beforeOperations.push(exports.wrapCommand_(cmd, context));
    });

    afterOperations = [
        function(callback) {
            exports.setupPlugins_(context, 'setupAfterHooks', callback);
        }
    ];

    after.forEach(function(cmd) {
        afterOperations.push(exports.wrapCommand_(cmd, context));
    });

    afterOperations.push(function(callback) {
        process.env.NODEGH_HOOK_IS_LOCKED = false;
        callback();
    });

    process.env.NODEGH_HOOK_IS_LOCKED = true;

    async.series(beforeOperations, function() {
        opt_callback && opt_callback(function() {
            async.series(afterOperations);
        });
    });
};

exports.setupPlugins_ = function(context, setupFn, opt_callback) {
    var plugins = base.getPlugins(),
        operations = [];

    plugins.forEach(function(plugin) {
        plugin = base.getPlugin(plugin);
        if (plugin && plugin[setupFn]) {
            operations.push(function(callback) {
                plugin[setupFn](context, callback);
            });
        }
    });

    async.series(operations, function() {
        opt_callback && opt_callback();
    });
};

exports.wrapCommand_ = function(cmd, context) {
    return function(callback) {
        var args,
            raw = cmd,
            rawLog = raw,
            log = false;

        if (typeof raw === 'object') {
            args = cmd.args;
            log = cmd.log;
            raw = cmd.cmd;
        }

        raw = rawLog = logger.compileTemplate(raw, context);

        if (raw) {
            if (args) {
                // Compile template for arguments.
                args.forEach(function(arg, index) {
                    args[index] = logger.compileTemplate(arg, context);
                });

                rawLog += ' ' + args.join(' ');
            }

            logger.log('[hook]', truncate(rawLog.trim(), 120));
            exports.exec_(raw, args, process.cwd(), log, callback);
        }
        else {
            callback && callback();
        }
    };
};
