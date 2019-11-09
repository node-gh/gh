/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as Future from 'fluture'
import { env as flutureEnv } from 'fluture-sanctuary-types'
import * as fs from 'fs'
import produce, { setAutoFreeze } from 'immer'
import * as nopt from 'nopt'
import * as path from 'path'
import * as R from 'ramda'
import { create, env } from 'sanctuary'
import * as updateNotifier from 'update-notifier'
import { getConfig, getUser } from './base'
import * as logger from './logger'
import {
    createGlobalConfig,
    getGlobalPackageJson,
    getUserHomePath,
    addPluginConfig,
} from './configs'
import { prepend, safeReaddir, safeImport, safeRealpath, safeWhich } from './fp'
import * as git from './git'
import { getGitHubInstance } from './github'

const testing = process.env.NODE_ENV === 'testing'

// Make Fluture Play nicely with Sanctuary
const S = create({ checkTypes: true, env: env.concat(flutureEnv) })

// Allow mutation of options when not testing
// https://immerjs.github.io/immer/docs/freezing
setAutoFreeze(testing)

Future.debugMode(testing)

interface CommandInterface {
    name: string
    isPlugin?: boolean
    DETAILS: {
        alias: string
        description: string
        commands: string
        options: object
        shorthands: object
    }
    run: (options?: any, done?: any) => {}
}

interface PluginInterface extends CommandInterface {
    new (any): CommandInterface
}

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
 * Builds out the absolute path of the non plugin cmd
 */
function buildFilePath(filename: string): string {
    const commandDir = path.join(__dirname, 'cmds')

    const fullFileName = filename.includes('.') ? filename : `${filename}`
    const absolutePath = path.join(commandDir, fullFileName)

    return absolutePath
}

type TryResolvingByPlugin = (a: string) => Future.FutureInstance<NodeJS.ErrnoException, string>
/**
 * Try to determine if cmd passed in is a plugin
 */
export const tryResolvingByPlugin: TryResolvingByPlugin = R.pipeK(
    prepend('gh-'),
    safeWhich,
    safeRealpath
)

/**
 * Checks if cmd is a valid alias
 */
export function tryResolvingByAlias(name: string): Future.FutureInstance<string, string> {
    const cmdDir = path.join(__dirname, 'cmds')

    return safeReaddir(cmdDir)
        .chain(filterFiles)
        .chainRej(() => Future.reject(name))

    function filterFiles(files: string[]): Future.FutureInstance<string, string> {
        const cmdFileName = files.filter((file: string) => {
            return file.startsWith(name[0]) && file.includes(name[1])
        })[0]

        return cmdFileName ? Future.of(cmdFileName) : Future.reject(name)
    }
}

// Some plugins have the Impl prop housing the main class
// For backwards compat, we will flatten it if it exists
function flattenIfImpl(obj) {
    return obj.Impl ? obj.Impl : obj
}

export function loadCommand(
    args: Args
): Future.FutureInstance<NodeJS.ErrnoException, CommandInterface> {
    return tryResolvingByHelpOrVersion(args)
        .chainRej(tryResolvingByAlias)
        .map(buildFilePath)
        .chainRej(tryResolvingByPlugin)
        .chain(safeImport)
        .map(flattenIfImpl)
}

function getCommand(
    args: string[]
): Future.FutureInstance<{ value: string }, { value: CommandInterface }> {
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

        // default the page size to 30
        draft.allPages = config.page_size === ''
        draft.pageSize = config.page_size || 30
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

        draft.userRepo = logger.colors.green(`${draft.user}/${draft.repo}`)
    })

    return options
}

/* !! IMPURE CALLING CODE !! */
export async function run() {
    process.env.GH_PATH = path.join(__dirname, '../')

    if (!fs.existsSync(getUserHomePath())) {
        createGlobalConfig()
    }

    notifyVersion()

    getCommand(process.argv).fork(
        errMsg => console.log(errMsg),
        async ({ value: Command }) => {
            const args = getAvailableArgsOnCmd(Command)
            let cmdDoneRunning = null

            if (testing) {
                const { prepareTestFixtures } = await import('./test-utils')

                // Enable mock apis for e2e's
                cmdDoneRunning = prepareTestFixtures(Command.name, args.argv.cooked)
            }

            const options = await buildOptions(args, Command.name)

            // Maintain backwards compat with plugins implemented as classes
            if (typeof Command === 'function') {
                const Plugin: PluginInterface = Command

                addPluginConfig(Plugin.name)

                await new Plugin(options).run(cmdDoneRunning)
            } else {
                await Command.run(options, cmdDoneRunning)
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
function getAvailableArgsOnCmd(Command: CommandInterface) {
    return nopt(Command.DETAILS.options, Command.DETAILS.shorthands, process.argv, 2)
}
