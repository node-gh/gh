/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as truncate from 'truncate'
import * as configs from './configs'
import * as exec from './exec'
import * as logger from './logger'
import { tryResolvingByPlugin } from './cmd'
import { safeImport } from './fp'
const testing = process.env.NODE_ENV === 'testing'

export function createContext(scope) {
    return {
        options: scope.options,
        signature: scope.options.config.signature,
    }
}

export function getHooksFromPath(path, config: any) {
    const keys = path.split('.')
    let key = keys.shift()
    let hooks

    hooks = config.hooks || {}

    while (hooks[key]) {
        hooks = hooks[key]
        key = keys.shift()
    }

    return Array.isArray(hooks) ? hooks : []
}

export async function afterHooks(path, scope) {
    const after = getHooksFromPath(`${path}.after`, scope.options.config)
    const options = scope.options

    if (options.hooks === false || process.env.NODEGH_HOOK_IS_LOCKED) {
        return
    }

    let context = createContext(scope)

    if (!testing) {
        const pluginContext = await setupPlugins_(context, 'setupAfterHooks')

        if (pluginContext) {
            context = { ...context, ...pluginContext }
        }
    }

    after.forEach(cmd => {
        wrapCommand_(cmd, context, 'after')
    })

    process.env.NODEGH_HOOK_IS_LOCKED = 'true'
}

export async function beforeHooks(path, scope) {
    const before = getHooksFromPath(`${path}.before`, scope.options.config)
    const options = scope.options

    if (options.hooks === false || process.env.NODEGH_HOOK_IS_LOCKED) {
        return
    }

    let context = createContext(scope)

    if (!testing) {
        const pluginContext = await setupPlugins_(context, 'setupBeforeHooks')

        if (pluginContext) {
            context = { ...context, ...pluginContext }
        }
    }

    before.forEach(cmd => {
        wrapCommand_(cmd, context, 'before')
    })
}

async function setupPlugins_(context, setupFn): Promise<object> {
    const plugins = configs.getPlugins()

    return Promise.all(
        plugins.map(async pluginName => {
            // Slice off extra 'gh-' so it isn't 'gh-gh-'
            const name = pluginName.slice(3)

            try {
                var pluginFile = await tryResolvingByPlugin(name)
                    .chain(safeImport)
                    .promise()
            } catch (e) {
                logger.warn(`Can't get ${name} plugin.`)
            }

            if (pluginFile && configs.pluginHasConfig(pluginName) && pluginFile[setupFn]) {
                // TODO: find a better state sharing mechanism than mutation
                // Currently our approach is to give each plugin a chance to
                // update the main options object for the before & after hooks
                pluginFile[setupFn](context)
            }
        })
    )
}

export function wrapCommand_(cmd, context, when) {
    const raw = logger.compileTemplate(cmd, context)

    if (!raw) {
        return
    }

    logger.log(logger.colors.cyan('[hook]'), truncate(raw.trim(), 120))

    if (testing) return

    try {
        exec.execSyncInteractiveStream(raw, { cwd: process.cwd() })
    } catch (e) {
        logger.debug(`[${when} hook failure]`)
    } finally {
        logger.debug(logger.colors.cyan(`[end of ${when} hook]`))
    }
}
