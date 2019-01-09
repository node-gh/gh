"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const logger = require("./logger");
function spawnSync(cmd, args, options) {
    var exec;
    logger.debug(`spawnSync: ${cmd} ${args.join(' ')}`);
    exec = child_process.spawnSync(cmd, args, options);
    if (exec.error && exec.error.code === 'ENOENT' && process.platform === 'win32') {
        logger.debug("Invoking patched sapwnSync due to Windows' libuv bug");
        exec = child_process.spawnSync(`${cmd}.cmd`, args, options);
    }
    return {
        stdout: exec.stdout.toString().trim(),
        stderr: exec.stderr.toString().trim(),
        status: exec.status,
    };
}
exports.spawnSync = spawnSync;
function spawnSyncStream(cmd, args, options) {
    let proc;
    let err;
    if (!options) {
        options = {};
    }
    options.stdio = ['pipe', process.stdout, process.stderr];
    logger.debug(`spawnSyncStream: ${cmd} ${args.join(' ')}`);
    proc = child_process.spawnSync(cmd, args, options);
    if (proc.status !== 0) {
        err = new Error();
        err.code = proc.status;
        err.message = `Child process terminated with error code ${err.code}`;
        throw err;
    }
    return proc;
}
exports.spawnSyncStream = spawnSyncStream;
function execSync(cmd, options) {
    if (!options) {
        options = {};
    }
    logger.debug(`execSync: ${cmd}`);
    options.stdio = ['pipe', process.stdout, process.stderr];
    return child_process.execSync(cmd, options);
}
exports.execSync = execSync;
function execSyncInteractiveStream(cmd, options) {
    if (!options) {
        options = {};
    }
    logger.debug(`execSyncInteractiveStream: ${cmd}`);
    options.stdio = 'inherit';
    return child_process.execSync(cmd, options);
}
exports.execSyncInteractiveStream = execSyncInteractiveStream;
