/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as async from 'async'
import * as fs from 'fs'
import * as nopt from 'nopt'
import * as path from 'path'
import { checkVersion, clone, expandAliases, find, getUser, load } from './base'
import * as configs from './configs'
import * as git from './git'
import { getGitHubInstance } from './GitHub'

const config = configs.getConfig()

// allows to run program as js or ts
const extension = __filename.slice(__filename.lastIndexOf('.') + 1)

// -- Utils ----------------------------------------------------------------------------------------

function hasCommandInOptions(commands, options) {
    if (commands) {
        return commands.some(c => {
            return options[c] !== undefined
        })
    }

    return false
}

function invokePayload(options, command, cooked, remain) {
    var payload

    if (command.DETAILS.payload && !hasCommandInOptions(command.DETAILS.commands, options)) {
        payload = remain.concat()
        payload.shift()
        command.DETAILS.payload(payload, options)
    }
}

async function resolveCmd(name, commandDir) {
    const reg = new RegExp(`.${extension}$`, 'i')
    const commandFiles = find(commandDir, reg)

    const commandName = commandFiles.filter(file => {
        switch (file) {
            case `milestone.${extension}`:
                if (name === 'ms') return true
                break
            case `notification.${extension}`:
                if (name === 'nt') return true
                break
            case `pull-request.${extension}`:
                if (name === 'pr') return true
                break
        }

        if (file.startsWith(name)) {
            return true
        }

        return false
    })[0]

    if (commandName) {
        return await import(path.join(commandDir, commandName))
    }

    return resolvePlugin(name)
}

function resolvePlugin(name) {
    // If plugin command exists, register the executed plugin name on
    // process.env. This may simplify core plugin infrastructure.
    process.env.NODEGH_PLUGIN = name

    return { default: configs.getPlugin(name).Impl }
}

async function loadCommand(name) {
    let Command

    const commandDir = path.join(__dirname, 'cmds')
    const commandPath = path.join(commandDir, `${name}.${extension}`)

    if (fs.existsSync(commandPath)) {
        Command = await import(commandPath)
    } else {
        Command = await resolveCmd(name, commandDir)
    }

    return Command.default
}

export function setUp() {
    let Command
    let iterative
    let options
    const operations = []
    const parsed = nopt(process.argv)
    let remain = parsed.argv.remain
    let cooked = parsed.argv.cooked

    //

    //

    operations.push(callback => {
        checkVersion()

        callback()
    })

    operations.push(async callback => {
        var module = remain[0]

        if (cooked[0] === '--version' || cooked[0] === '-v') {
            module = 'version'
        } else if (!remain.length || cooked.indexOf('-h') >= 0 || cooked.indexOf('--help') >= 0) {
            module = 'help'
        }

        try {
            Command = await loadCommand(module)
        } catch (err) {
            throw new Error(`Cannot find module ${module}\n${err}`)
        }

        options = nopt(Command.DETAILS.options, Command.DETAILS.shorthands, process.argv, 2)

        iterative = Command.DETAILS.iterative

        cooked = options.argv.cooked
        remain = options.argv.remain

        options.number = options.number || [remain[1]]
        options.remote = options.remote || config.default_remote
    })

    async.series(operations, async () => {
        let iterativeValues
        const remoteUrl = git.getRemoteUrl(options.remote)

        options.isTTY = {}
        options.isTTY.in = Boolean(process.stdin.isTTY)
        options.isTTY.out = Boolean(process.stdout.isTTY)
        options.loggedUser = getUser()
        options.remoteUser = git.getUserFromRemoteUrl(remoteUrl)

        if (!options.user) {
            if (options.repo || options.all) {
                options.user = options.loggedUser
            } else {
                options.user = process.env.GH_USER || options.remoteUser || options.loggedUser
            }
        }

        options.repo = options.repo || git.getRepoFromRemoteURL(remoteUrl)
        options.currentBranch = options.currentBranch || git.getCurrentBranch()

        expandAliases(options)
        options.github_host = config.github_host
        options.github_gist_host = config.github_gist_host

        // Try to retrieve iterative values from iterative option key,
        // e.g. option['number'] === [1,2,3]. If iterative option key is not
        // present, assume [undefined] in order to initialize the loop.
        iterativeValues = options[iterative] || [undefined]

        iterativeValues.forEach(async value => {
            options = clone(options)

            // Value can be undefined when the command doesn't have a iterative
            // option.
            options[iterative] = value

            invokePayload(options, Command, cooked, remain)

            const GitHub = await getGitHubInstance()

            if (process.env.NODE_ENV === 'testing') {
                const { prepareTestFixtures } = await import('./test-utils')

                await new Command(options, GitHub).run(prepareTestFixtures(Command.name, cooked))
            } else {
                await new Command(options, GitHub).run()
            }
        })
    })
}

export function run() {
    if (!fs.existsSync(configs.getUserHomePath())) {
        configs.createGlobalConfig()
    }

    load()
    configs.getConfig()

    // If configs.PLUGINS_PATH_KEY is undefined, try to cache it before proceeding.
    if (configs.getConfig()[configs.PLUGINS_PATH_KEY] === undefined) {
        configs.getNodeModulesGlobalPath()
    }

    try {
        process.env.GH_PATH = path.join(__dirname, '../')

        this.setUp()
    } catch (e) {
        console.error(e.stack || e)
    }
}
