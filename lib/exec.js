/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Henrique Vicente <henriquevicente@gmail.com>
 */

'use strict';

var child_process = require('child_process'),
    logger = require('./logger');

exports.spawnSync = function (cmd, args, options) {
    var exec;

    logger.debug('spawnSync: ' + cmd + ' ' + args.join(' '));

    exec = child_process.spawnSync(cmd, args, options);

    if (exec.error && exec.error.code === 'ENOENT' && process.platform === 'win32') {
        logger.debug('Invoking patched sapwnSync due to Windows\' libuv bug');
        exec = child_process.spawnSync(cmd + '.cmd', args, options);
    }

    return {
        stdout: exec.stdout.toString().trim(),
        stderr: exec.stderr.toString().trim(),
        status: exec.status
    };
};

exports.spawnSyncStream = function (cmd, args, options) {
    var proc,
        err;

    if (!options) {
        options = {};
    }

    options.stdio = ['pipe', process.stdout, process.stderr];

    logger.debug('spawnSyncStream: ' + cmd + ' ' + args.join(' '));

    proc = child_process.spawnSync(cmd, args, options);

    if (proc.status !== 0) {
        err = new Error();
        err.code = proc.status;
        err.message = 'Child process terminated with error code ' + err.code;

        throw err;
    }

    return proc;
};

exports.execSync = function (cmd, options) {
    if (!options) {
        options = {};
    }

    logger.debug('execSync: ' + cmd);

    options.stdio = ['pipe', process.stdout, process.stderr];

    return child_process.execSync(cmd, options);
};

exports.execSyncInteractiveStream = function (cmd, options) {
    if (!options) {
        options = {};
    }

    logger.debug('execSyncInteractiveStream: ' + cmd);

    options.stdio = 'inherit';

    return child_process.execSync(cmd, options);
};
