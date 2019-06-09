/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import Command, { flags } from '@oclif/command'
import * as fs from 'fs'

import * as configs from './configs'
import * as git from './git'

const config = configs.getConfig()
const testing = process.env.NODE_ENV === 'testing'

export default abstract class extends Command {
    public static flags: any = {
        help: flags.help({ char: 'h' }),
        debug: flags.boolean({
            description:
                'A more complete info flag, which leaks more privacy sensitive data by default.',
        }),
        info: flags.boolean({
            description: 'The info flag is useful for basic debugging',
        }),
        remote: flags.string({
            description: 'Override the default_remote setting in ~/.default.gh.json',
        }),
        repo: flags.string({ char: 'r', description: 'The repo to fetch issues from' }),
        user: flags.string({ char: 'u', description: 'The owner of the repository' }),
    }

    public flags
    public remoteInfo

    public async init() {
        this.setGlobalFlags()
        this.initLogger()
    }

    private initLogger() {
        process.env.DEBUG = this.flags.debug
        process.env.INFO = this.flags.info
    }

    private setGlobalFlags() {
        // @ts-ignore: need to figure out if this error is benign
        const { flags } = this.parse(this.constructor)

        flags.remote = flags.remote || config.default_remote

        const remoteUrl = git.getRemoteUrl(flags.remote)

        flags.isTTY = {}
        flags.isTTY.in = Boolean(process.stdin.isTTY)
        flags.isTTY.out = Boolean(process.stdout.isTTY)
        flags.loggedUser = getUser()
        flags.remoteUser = git.getUserFromRemoteUrl(remoteUrl)

        if (!flags.user) {
            if (flags.repo || flags.all) {
                flags.user = flags.loggedUser
            } else {
                flags.user = process.env.GH_USER || flags.remoteUser || flags.loggedUser
            }
        }

        flags.repo = flags.repo || git.getRepoFromRemoteURL(remoteUrl)
        flags.currentBranch = testing ? 'master' : git.getCurrentBranch()
        flags.github_host = config.github_host
        flags.github_gist_host = config.github_gist_host

        this.flags = flags
    }
}

const verbose = process.argv.indexOf('--verbose') !== -1
const insane = process.argv.indexOf('--insane') !== -1

process.on('unhandledRejection', r => console.log(r))

if (verbose || insane) {
    process.env.GH_VERBOSE = 'true'
}

if (insane) {
    process.env.GH_VERBOSE_INSANE = 'true'
}

// -- Config -------------------------------------------------------------------

export function clone(o) {
    return JSON.parse(JSON.stringify(o))
}

// -- Utils --------------------------------------------------------------------

export function load() {}

export function find(filepath, opt_pattern) {
    return fs.readdirSync(filepath).filter(file => {
        return (opt_pattern || /.*/).test(file)
    })
}

export function getUser() {
    return config.github_user || process.env.GH_USER
}

// Export some config methods to allow plugins to access them
export const getConfig = configs.getConfig
export const writeGlobalConfig = configs.writeGlobalConfig
