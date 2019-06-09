/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as truncate from 'truncate'
import * as configs from './configs'
import * as exec from './exec'
import * as logger from './logger'

const config = configs.getConfig()

const testing = process.env.NODE_ENV === 'testing'

export function createContext(flags) {
    return {
        options: flags,
        signature: config.signature,
    }
}

export function getHooksArrayFromPath_(path, opt_config?: any) {
    const keys = path.split('.')
    let key = keys.shift()
    let hooks

    opt_config = opt_config || config

    hooks = opt_config.hooks || {}

    while (hooks[key]) {
        hooks = hooks[key]
        key = keys.shift()
    }

    return Array.isArray(hooks) ? hooks : []
}

export function getHooksFromPath(path) {
    return getHooksArrayFromPath_(path)
}

export async function afterHooks(path, flags) {
    const after = getHooksFromPath(`${path}.after`)

    if (flags.hooks === false || process.env.NODEGH_HOOK_IS_LOCKED) {
        return
    }

    let context = createContext(flags)

    after.forEach(cmd => {
        wrapCommand_(cmd, context, 'after')
    })

    process.env.NODEGH_HOOK_IS_LOCKED = 'true'
}

export async function beforeHooks(path, flags) {
    const before = getHooksFromPath(`${path}.before`)

    if (flags.hooks === false || process.env.NODEGH_HOOK_IS_LOCKED) {
        return
    }

    let context = createContext(flags)

    before.forEach(cmd => {
        wrapCommand_(cmd, context, 'before')
    })
}

export function wrapCommand_(cmd, context, when) {
    const raw = logger.compileTemplate(cmd, context)

    if (!raw) {
        return
    }

    logger.log(logger.colors.cyan(`{${when}-hook}`), truncate(raw.trim(), 120))

    if (testing) return

    try {
        exec.execSyncInteractiveStream(raw, { cwd: process.cwd() })
    } catch (e) {
        logger.debug(`[${when} hook failure]`)
    } finally {
        logger.debug(logger.colors.cyan(`[end of ${when} hook]`))
    }
}
