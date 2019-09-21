/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as child_process from 'child_process'
import * as logger from './logger'

export function spawnSync(cmd, args, options?: object) {
    var exec

    logger.debug(`spawnSync: ${cmd} ${args.join(' ')}`)

    exec = child_process.spawnSync(cmd, args, options)

    if (exec.error && exec.error.code === 'ENOENT' && process.platform === 'win32') {
        logger.debug("Invoking patched sapwnSync due to Windows' libuv bug")
        exec = child_process.spawnSync(`${cmd}.cmd`, args, options)
    }

    return {
        stdout: exec.stdout.toString().trim(),
        stderr: exec.stderr.toString().trim(),
        status: exec.status,
    }
}

export function spawnSyncStream(cmd, args, options?: any) {
    let proc
    let err

    if (!options) {
        options = {}
    }

    options.stdio = ['pipe', process.stdout, process.stderr]

    logger.debug(`spawnSyncStream: ${cmd} ${args.join(' ')}`)

    proc = child_process.spawnSync(cmd, args, options)

    if (proc.status !== 0) {
        err = new Error()
        err.code = proc.status
        err.message = `Child process terminated with error code ${err.code}`

        throw err
    }

    return proc
}

export function execSync(cmd, options) {
    if (!options) {
        options = {}
    }

    logger.debug(`execSync: ${cmd}`)

    options.stdio = ['pipe', process.stdout, process.stderr]

    return child_process.execSync(cmd, options)
}

export function execSyncInteractiveStream(cmd, options) {
    if (!options) {
        options = {}
    }

    logger.debug(`execSyncInteractiveStream: ${cmd}`)

    options.stdio = 'inherit'

    return child_process.execSync(cmd, options)
}
