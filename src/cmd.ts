/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as fs from 'fs'
import * as nopt from 'nopt'
import * as path from 'path'
import * as updateNotifier from 'update-notifier'
import { find, getUser } from './base'
import * as configs from './configs'
import * as git from './git'
import * as logger from './logger'

const config = configs.getConfig()

// allows to run program as js or ts
const extension = __filename.slice(__filename.lastIndexOf('.') + 1)

const testing = process.env.NODE_ENV === 'testing'

// -- Utils ----------------------------------------------------------------------------------------

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

    return commandName && import(path.join(commandDir, commandName))
}

async function resolvePlugin(name) {
    // If plugin command exists, register the executed plugin name
    process.env.NODEGH_PLUGIN = name

    const plugin = await configs.getPlugin(name)
    const pluginFullName = plugin.Impl.name.toLowerCase()

    plugin && configs.addPluginConfig(pluginFullName)

    return plugin
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

    if (!Command) {
        // try to resolve as plugin
        const plugin = await resolvePlugin(name)

        Command = { default: plugin.Impl }
    }

    return Command.default
}

function notifyVersion() {
    var notifier = updateNotifier({ pkg: configs.getGlobalPackageJson() })

    if (notifier.update) {
        notifier.notify()
    }
}

export async function setUp() {
    let Command
    let options
    const parsed = nopt(process.argv)
    let remain = parsed.argv.remain
    let cooked = parsed.argv.cooked

    let module = remain[0]

    notifyVersion()

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

    if (!Command) {
        throw new Error(`No cmd or plugin found.`)
    }

    options = nopt(Command.DETAILS.options, Command.DETAILS.shorthands, process.argv, 2)

    cooked = options.argv.cooked
    remain = options.argv.remain

    options.number = options.number || [remain[1]]
    options.remote = options.remote || config.default_remote

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
    options.currentBranch = testing ? 'master' : git.getCurrentBranch()
    options.github_host = config.github_host
    options.github_gist_host = config.github_gist_host

    if (testing) {
        const { prepareTestFixtures } = await import('./utils')

        await new Command(options).run(prepareTestFixtures(Command.name, cooked))
    } else {
        await new Command(options).run()
    }
}

export async function run() {
    if (!fs.existsSync(configs.getUserHomePath())) {
        configs.createGlobalConfig()
    }

    try {
        process.env.GH_PATH = path.join(__dirname, '../')

        await setUp()
    } catch (e) {
        console.error(e.stack || e)
    }
}
