/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as Future from 'fluture'
import { env as flutureEnv } from 'fluture-sanctuary-types'
import * as fs from 'fs'
import * as nopt from 'nopt'
import * as path from 'path'
import * as R from 'ramda'
import { env, create } from 'sanctuary'
import * as updateNotifier from 'update-notifier'
import { getConfig, getUser } from './base'
import { createGlobalConfig, getGlobalPackageJson, getUserHomePath } from './configs'
import { safeImport, readdirFuture, safeWhich, safeRealpath, prepend } from './fp'
import produce, { setAutoFreeze } from 'immer'
import * as git from './git'
import { getGitHubInstance } from './github'

const testing = process.env.NODE_ENV === 'testing'

// Allow mutation of options when not testing
// https://immerjs.github.io/immer/docs/freezing
!testing && setAutoFreeze(false)

const S = create({ checkTypes: true, env: env.concat(flutureEnv) })

Future.debugMode(true)

// interface Command {
//     name: string
//     isPlugin?: boolean
//     DETAILS: {
//         alias: string
//         description: string
//         commands: string
//         options: object
//         shorthands: object
//     }
//     run: () => {}
// }

// -- Utils ----------------------------------------------------------------------------------------

interface Args {
    cooked?: string[]
    remain?: string[]
}

/**
 * Figure out if cmd is either the Version of Help cmd
 */
export function tryResolvingByHelpOrVersion({ cooked, remain }: Args = {}): Future.FutureInstance<
    string,
    string
> {
    let cmdName = null

    const isVersionCmd = cooked[0] === '--version' || cooked[0] === '-v'
    const isHelpCmd = !remain.length || cooked.includes('-h') || cooked.includes('--help')

    if (isVersionCmd) {
        cmdName = 'version'
    } else if (isHelpCmd) {
        cmdName = 'help'
    }

    return cmdName ? Future.of(cmdName) : Future.reject(remain[0])
}

/**
 * Builds out the absolute path
 */
function buildFilePath(filename: string): string {
    const commandDir = path.join(__dirname, 'cmds')

    // allows to run program as js normally or ts when debugging
    const extension = __filename.slice(__filename.lastIndexOf('.') + 1)
    const fullFileName = filename.includes('.') ? filename : `${filename}.${extension}`
    const absolutePath = path.join(commandDir, fullFileName)

    return absolutePath
}

export const tryResolvingByPlugin = R.pipeK(
    prepend('gh-'),
    safeWhich,
    safeRealpath
)

/**
 * Function that checks if cmd is a valid alias
 */
export const tryResolvingByAlias: any = name => {
    const cmdDir = path.join(__dirname, 'cmds')

    return readdirFuture(cmdDir).chain(filterFiles)

    function filterFiles(files): any {
        const alias = files.filter(file => {
            return file.startsWith(name[0]) && file.includes(name[1])
        })[0]

        return alias ? Future.of(alias) : Future.reject(name)
    }
}

// Some plugins have the Impl prop housing the main class
// For backwards compat, we will flatten it if it exists
function flattenIfImpl(obj) {
    const impl = obj.Impl

    return impl ? impl : obj
}

export function loadCommand(args: Args) {
    return tryResolvingByHelpOrVersion(args)
        .chainRej(tryResolvingByAlias)
        .map(buildFilePath)
        .chainRej(tryResolvingByPlugin)
        .chain(safeImport)
        .map(flattenIfImpl)
}

function getCommand(args: string[]) {
    /**
     * nopt function returns:
     *
     * remain: The remaining args after all the parsing has occurred.
     * original: The args as they originally appeared.
     * cooked: The args after flags and shorthands are expanded.
     */
    const parsed = nopt(args)
    const remain = parsed.argv.remain
    const module = remain[0]

    const Command = loadCommand(parsed.argv)

    return Command.fold(() => S.Left(`Cannot find module ${module}`), S.Right)
}

function notifyVersion(): void {
    const notifier = updateNotifier({ pkg: getGlobalPackageJson() })

    if (notifier.update) {
        notifier.notify()
    }
}

export async function buildOptions(args, cmdName) {
    const options = produce(args, async draft => {
        const config = getConfig()

        // Gets 2nd positional arg (`gh pr 1` will return 1)
        const secondArg = [draft.argv.remain[1]]
        const remote = draft.remote || config.default_remote
        const remoteUrl = git.getRemoteUrl(remote)

        if (cmdName !== 'Help' && cmdName !== 'Version') {
            // We don't want to boot up Ocktokit if user just wants help or version
            draft.GitHub = await getGitHubInstance()
        }

        draft.config = config
        draft.remote = remote
        draft.number = draft.number || secondArg
        draft.loggedUser = getUser()
        draft.remoteUser = git.getUserFromRemoteUrl(remoteUrl)
        draft.repo = draft.repo || git.getRepoFromRemoteURL(remoteUrl)
        draft.currentBranch = git.getCurrentBranch()
        draft.github_host = config.github_host
        draft.github_gist_host = config.github_gist_host

        if (!draft.user) {
            if (args.repo || args.all) {
                draft.user = draft.loggedUser
            } else {
                draft.user = process.env.GH_USER || draft.remoteUser || draft.loggedUser
            }
        }

        /**
         * Checks if there are aliases in your .gh.json file.
         * If there are aliases in your .gh.json file, we will attempt to resolve the user, PR forwarder or PR submitter to your alias.
         */
        if (config.alias) {
            draft.fwd = config.alias[draft.fwd] || draft.fwd
            draft.submit = config.alias[draft.submit] || draft.submit
            draft.user = config.alias[draft.user] || draft.user
        }
    })

    return options
}

/* IMPURE CALLING CODE */
export async function run() {
    process.env.GH_PATH = path.join(__dirname, '../')

    if (!fs.existsSync(getUserHomePath())) {
        createGlobalConfig()
    }

    notifyVersion()

    getCommand(process.argv).fork(
        a => console.log('ERROR --------->', a),
        async ({ value: Command }) => {
            const args = getAvailableArgsOnCmd(Command)

            if (testing) {
                var { prepareTestFixtures } = await import('./utils')

                // Enable mock apis for e2e's
                var cmdDoneRunning = prepareTestFixtures(Command.name, args.argv.cooked)
            }

            const options = await buildOptions(args, Command.name)

            if (testing) {
                if (Command.isPlugin) {
                    await new Command(options).run(cmdDoneRunning)
                } else {
                    await Command.run(options, cmdDoneRunning)
                }
            } else {
                if (Command.isPlugin) {
                    await new Command(options).run()
                } else {
                    await Command.run(options)
                }
            }
        }
    )
}

/**
 * If you run `gh pr 1 -s node-gh --remote=origin --user protoEvangelion`, nopt will return
 *
 *   {
 *     remote: 'origin',
 *     submit: 'node-gh',
 *     user: 'protoEvangelion',
 *     argv: {
 *         original: ['pr', '1', '-s', 'pr', 'node-gh', '--remote', 'origin', '--user', 'protoEvangelion'],
 *         remain: ['pr', '1'],
 *         cooked: ['pr', '1', '--submit', 'node-gh', '--remote', 'origin', '--user', 'protoEvangelion'],
 *     },
 *   }
 *
 * Historically we passed every arg after 2nd arg (gh pr 1 -s user; everything after 'pr')
 * and all parsed options to each cmd's payload function to figure out positional args and allow for neat shortcuts like:
 * gh is 'new issue' 'new issue description'
 */
function getAvailableArgsOnCmd(Command) {
    return nopt(Command.DETAILS.options, Command.DETAILS.shorthands, process.argv, 2)
}
