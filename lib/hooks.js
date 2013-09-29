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
    spawn = require('child_process').spawn,
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
            function(error, stdout, stdin) {
                if (opt_log) {
                    logger.log(error, stdout, stdin);
                }

                if (error) {
                    logger.custom('[error]', clc.redBright, logger.getErrorMessage(error));
                }
                callback();
            });
    }
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
            rawLog = raw;
        }

        raw = logger.compileTemplate(raw, context);

        if (raw) {
            if (args) {
                rawLog += ' ' + args.join(' ');
            }

            logger.log('[hook]', rawLog.trim());
            exports.exec_(raw, args, process.cwd(), log, callback);
        }
        else {
            callback && callback();
        }
    };
};