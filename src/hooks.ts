/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as truncate from 'truncate'
import * as configs from './configs'
import * as exec from './exec'
import * as logger from './logger'

const config = configs.getConfig()

const testing = process.env.NODE_ENV === 'testing'

export function createContext(scope) {
    return {
        options: scope.options,
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

export async function afterHooks(path, scope) {
    const after = getHooksFromPath(`${path}.after`)
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
    const before = getHooksFromPath(`${path}.before`)
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

    const contextArr = await Promise.all(
        plugins.map(async pluginName => {
            try {
                var pluginFile = await configs.getPlugin(pluginName)
            } catch (e) {
                logger.warn(`Can't get ${pluginName} plugin.`)
            }

            if (pluginFile && configs.pluginHasConfig(pluginName) && pluginFile[setupFn]) {
                const newContext = pluginFile[setupFn](context)
                return newContext
            }
        })
    )

    return contextArr.filter(plugin => plugin !== undefined).reduce(mergeArrayOfObjects, false)
}

function mergeArrayOfObjects(accumulatedObject, currentObject): object | boolean {
    if (!currentObject) return accumulatedObject

    return { ...accumulatedObject, ...currentObject }
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
