/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as fs from 'fs'
import { cloneDeep } from 'lodash'
import * as path from 'path'
import * as R from 'ramda'
import * as S from 'sanctuary'
import * as $ from 'sanctuary-def'
import * as userhome from 'userhome'
import * as which from 'which'
import * as exec from './exec'
import * as logger from './logger'
import { safeImport } from './fp'

export const PLUGINS_PATH_KEY = 'plugins_path'

const testing = process.env.NODE_ENV === 'testing'

/* Refactored FP Functions */

const safeWhich = S.encase(which.sync)
const safeRealpath = S.encase(fs.realpathSync)

export const getPluginPath = R.pipeK(
    safeWhich,
    safeRealpath
)

// TODO merge with getPlugin fn in cmd.ts
export const getPlugin = R.pipeK(
    S.prepend('gh-'),
    getPluginPath,
    safeImport
)

/* ----------------------- */

// function concatError(leftMonad, errorMessage) {
//     const leftMonadContainsError = leftMonad && leftMonad.isLeft() && leftMonad.value

//     return leftMonadContainsError ? leftMonad.map(mapError) : Left(errorMessage)

//     function mapError(prevErrorMessage) {
//         return `${prevErrorMessage}\n${errorMessage}`
//     }
// }

// -- Config -------------------------------------------------------------------

export function getNodeModulesGlobalPath() {
    try {
        var { stdout } = exec.spawnSync('npm', ['root', '-g'])
    } catch (err) {
        logger.warn(`Can't resolve plugins directory path.\n${err}`)
    }

    return stdout
}

export function getGlobalPackageJson() {
    const configFile = fs.readFileSync(path.join(__dirname, '../package.json'))

    return JSON.parse(configFile.toString())
}

export function getDefaultConfigPath() {
    return path.join(__dirname, '../default.gh.json')
}

export function getProjectConfigPath() {
    return path.join(process.cwd(), '.gh.json')
}

export function getUserHomePath() {
    return userhome('.gh.json')
}

function resolveGHConfigs() {
    const globalConfig = getGlobalConfig()
    let projectConfig
    const result = {}

    try {
        projectConfig = JSON.parse(fs.readFileSync(getProjectConfigPath()).toString())

        Object.keys(globalConfig).forEach(key => {
            result[key] = globalConfig[key]
        })

        Object.keys(projectConfig).forEach(key => {
            result[key] = projectConfig[key]
        })

        return result
    } catch (e) {
        logger.debug(e.message)

        if (e.code !== 'MODULE_NOT_FOUND' && e.code !== 'ENOENT') {
            throw e
        }

        return globalConfig
    }
}

export function getConfig() {
    const config = resolveGHConfigs()

    const protocol = `${config.api.protocol}://`
    const is_enterprise = config.api.host !== 'api.github.com'

    if (config.github_host === undefined) {
        config.github_host = `${protocol}${is_enterprise ? config.api.host : 'github.com'}`
    }
    if (config.github_gist_host === undefined) {
        config.github_gist_host = `${protocol}${
            is_enterprise ? `${config.api.host}/gist` : 'gist.github.com'
        }/`
    }

    return config
}

export function getGlobalConfig() {
    const configPath = getUserHomePath()
    const defaultPath = getDefaultConfigPath()

    if (!fs.existsSync(configPath)) {
        createGlobalConfig()
    }

    return JSON.parse(fs.readFileSync(testing ? defaultPath : configPath).toString())
}

export function removeGlobalConfig(key) {
    var config = getGlobalConfig()

    delete config[key]

    saveJsonConfig(getUserHomePath(), config)
}

export function createGlobalConfig() {
    saveJsonConfig(
        getUserHomePath(),
        JSON.parse(fs.readFileSync(getDefaultConfigPath()).toString())
    )
}

export function writeGlobalConfig(jsonPath, value) {
    const config = getGlobalConfig()
    let i
    let output
    let path
    let pathLen

    path = jsonPath.split('.')
    output = config

    for (i = 0, pathLen = path.length; i < pathLen; i++) {
        output[path[i]] = config[path[i]] || (i + 1 === pathLen ? value : {})
        output = output[path[i]]
    }

    saveJsonConfig(getUserHomePath(), config)
}

export function saveJsonConfig(path, object) {
    fs.writeFileSync(path, JSON.stringify(object, null, 4))
}

export function writeGlobalConfigCredentials(user, token, path): void {
    const configPath = path || getUserHomePath()

    let config
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath).toString())
    } else {
        config = JSON.parse(fs.readFileSync(getDefaultConfigPath()).toString())
    }

    logger.log(`Writing GH config data: ${configPath}`)

    try {
        config.github_user = user
        config.github_token = token

        saveJsonConfig(configPath, config)
    } catch (err) {
        throw new Error(`Error writing credentials to global config\n${err}`)
    }

    logger.log('Authentication succeed. Token written to global config.')
}

// -- Plugins ------------------------------------------------------------------

export function addPluginConfig(plugin) {
    try {
        const pluginConfig = require(path.join(
            getNodeModulesGlobalPath(),
            `gh-${plugin}`,
            'gh-plugin.json'
        ))

        const config = getGlobalConfig()
        const configHooks = cloneDeep(config.hooks)
        const pluginHooks = cloneDeep(pluginConfig.hooks)

        if (config.plugins[plugin] && !config.plugins[plugin]['hooks_installed']) {
            Object.keys(pluginHooks).forEach(cmd => {
                Object.keys(pluginHooks[cmd]).forEach(hook => {
                    configHooks[cmd][hook].before = [
                        ...configHooks[cmd][hook].before,
                        ...pluginHooks[cmd][hook].before,
                    ]

                    configHooks[cmd][hook].after = [
                        ...configHooks[cmd][hook].after,
                        ...pluginHooks[cmd][hook].after,
                    ]
                })
            })

            if (!testing) {
                logger.log(
                    logger.colors.yellow(
                        `Copying over ${plugin} plugin hooks to your .gh.json hooks.`
                    )
                )

                try {
                    config.hooks = configHooks
                    config.plugins[plugin]['hooks_installed'] = true

                    saveJsonConfig(getUserHomePath(), config)
                } catch (err) {
                    logger.error(`Error writing ${plugin} hooks to .gh.json config.\n${err}`)
                }

                logger.log(logger.colors.green('Copy successful.\n'))
            }
        }
    } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
            throw e
        }
    }
}

export function getPlugins() {
    const pluginsPath = getNodeModulesGlobalPath()

    if (pluginsPath === '') {
        return []
    }

    try {
        var plugins = fs.readdirSync(pluginsPath).filter(plugin => {
            return plugin.substring(0, 3) === 'gh-'
        })
    } catch (err) {
        logger.warn(`Can't read plugins directory.\n${err}`)
    }

    return plugins
}

export function pluginHasConfig(pluginName) {
    return Boolean(getConfig().plugins[pluginName])
}
