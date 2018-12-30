/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

export = {}

const async = require('async')
const configs = require('./configs')
const exec = require('./exec')
const truncate = require('truncate')
const logger = require('./logger')
const config = configs.getConfig(true)
const _ = require('lodash')

exports.createContext = function(scope) {
    return {
        options: scope.options,
        signature: config.signature,
    }
}

exports.getHooksArrayFromPath_ = function(path, opt_config) {
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

exports.getHooksFromPath = function(path) {
    let hooks
    const plugins = configs.getPlugins()
    let pluginHooks = []

    // First, load all core hooks for the specified path.
    hooks = exports.getHooksArrayFromPath_(path)

    // Second, search all installed plugins and load the hooks for each into
    // core hooks array.
    process.env.NODE_ENV !== 'testing' &&
        plugins.forEach(plugin => {
            var pluginConfig

            plugin = configs.getPluginBasename(plugin)

            if (config.plugins && !configs.isPluginIgnored(plugin)) {
                pluginConfig = config.plugins[plugin]

                if (pluginConfig) {
                    pluginHooks = pluginHooks.concat(
                        exports.getHooksArrayFromPath_(path, pluginConfig)
                    )
                }
            }
        })

    return hooks.concat(pluginHooks)
}

exports.invoke = function(path, scope, opt_callback) {
    const after = exports.getHooksFromPath(`${path}.after`)
    const before = exports.getHooksFromPath(`${path}.before`)
    let beforeOperations
    let afterOperations
    const options = scope.options
    let context

    if (options.hooks === false || process.env.NODEGH_HOOK_IS_LOCKED) {
        opt_callback && opt_callback(_.noop)
        return
    }

    context = exports.createContext(scope)

    beforeOperations = [
        function(callback) {
            exports.setupPlugins_(context, 'setupBeforeHooks', callback)
        },
    ]

    before.forEach(cmd => {
        beforeOperations.push(exports.wrapCommand_(cmd, context, 'before'))
    })

    afterOperations = [
        function(callback) {
            exports.setupPlugins_(context, 'setupAfterHooks', callback)
        },
    ]

    after.forEach(cmd => {
        afterOperations.push(exports.wrapCommand_(cmd, context, 'after'))
    })

    afterOperations.push(callback => {
        process.env.NODEGH_HOOK_IS_LOCKED = 'false'
        callback()
    })

    process.env.NODEGH_HOOK_IS_LOCKED = 'true'

    async.series(beforeOperations, () => {
        opt_callback &&
            opt_callback(() => {
                async.series(afterOperations)
            })
    })
}

exports.setupPlugins_ = function(context, setupFn, opt_callback) {
    const plugins = configs.getPlugins()
    const operations = []

    plugins.forEach(plugin => {
        try {
            plugin = configs.getPlugin(plugin)
        } catch (e) {
            logger.warn(`Can't get ${plugin} plugin.`)
        }

        if (plugin && plugin[setupFn]) {
            operations.push(callback => {
                plugin[setupFn](context, callback)
            })
        }
    })

    async.series(operations, () => {
        opt_callback && opt_callback()
    })
}

exports.wrapCommand_ = function(cmd, context, when) {
    return function(callback) {
        var raw = logger.compileTemplate(cmd, context)

        if (!raw) {
            callback && callback()
            return
        }

        logger.log(logger.colors.cyan('[hook]'), truncate(raw.trim(), 120))

        try {
            exec.execSyncInteractiveStream(raw, { cwd: process.cwd() })
        } catch (e) {
            logger.debug(`[${when} hook failure]`)
        } finally {
            logger.debug(logger.colors.cyan(`[end of ${when} hook]`))
        }

        callback && callback()
    }
}
