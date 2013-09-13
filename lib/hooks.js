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
    config = base.getGlobalConfig(),
    exec = require('child_process').exec,
    logger = require('./logger');

exports.invoke = function(path, scope, opt_callback) {
    var instance = this,
        after = exports.getHooksFromPath(path + '.after'),
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
    return {
        options: scope.options,
        signature: config.signature
    };
};

exports.getHooksFromPath = function(path) {
    var instance = this,
        keys = path.split('.'),
        key = keys.shift(),
        val = config.hooks;

    while (val[key]) {
        val = val[key];
        key = keys.shift();
    }

    return Array.isArray(val) ? val : [];
};

exports.exec_ = function(cmd, cwd, log, callback) {
    exec(cmd, {
        cwd: cwd,
        stdio: 'inherit'
    },
    function(error, stdout, stderr) {
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
        logger.log('[hook]', raw);
        exports.exec_(raw, process.cwd(), log, callback);
    };
};