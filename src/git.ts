/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as exec from './exec'
import * as logger from './logger'

const git_command = process.env.GH_GIT_COMMAND || 'git'

const testing = process.env.NODE_ENV === 'testing'

export function checkout(branch, newBranch?: string) {
    var args = ['checkout', branch]

    if (newBranch) {
        args.push('-B', newBranch)
    }

    return !testing && exec.spawnSyncStream(git_command, args)
}

export function clone(url, folder) {
    var args = ['clone', url]

    if (folder) {
        args.push(folder)
    }

    return !testing && exec.spawnSyncStream(git_command, args)
}

export function _merge(branch, type) {
    try {
        const args = [type, branch]

        !testing && exec.spawnSyncStream(git_command, [...args])
    } catch (err) {
        if (err.code && err.code !== 0) {
            !testing && exec.spawnSyncStream(git_command, [type, '--abort'])
            throw err
        }
    }
}

export function merge(branch) {
    return !testing && this._merge(branch, 'merge')
}

export function rebase(branch) {
    return !testing && this._merge(branch, 'rebase')
}

export function push(remote, branch) {
    var args = ['push', remote]

    if (branch) {
        args.push(branch)
    }

    return !testing && exec.spawnSyncStream(git_command, args)
}

export function fetch(repoUrl, headBranch, pullBranch) {
    var args = ['fetch', repoUrl, `${headBranch}:${pullBranch}`, '--no-tags']

    return !testing && exec.spawnSyncStream(git_command, args)
}

export function countUserAdjacentCommits() {
    let git
    let params
    let commits = 0
    const user = getConfig('user.name')
    let author

    do {
        params = ['log', '-1', `--skip=${commits}`, '--pretty=%an']
        git = exec.spawnSync(git_command, params)

        if (git.status !== 0) {
            logger.error(git.stderr)
        }

        author = git.stdout

        commits += 1
    } while (author === user)

    commits -= 1

    return commits
}

export function deleteBranch(branch) {
    if (testing) {
        return
    }

    var git = exec.spawnSync(git_command, ['branch', '-d', branch])

    if (git.status !== 0) {
        logger.debug(git.stderr)
    }

    return git.stdout
}

export function findRoot() {
    return exec.spawnSync(git_command, ['rev-parse', '--show-toplevel']).stdout
}

export function getCommitMessage(branch, number) {
    let git
    const params = ['log']

    if (!number) {
        number = 1
    }

    params.push(`-${number}`, '--first-parent', '--no-merges', '--pretty=%s')

    if (branch) {
        params.push(branch)
    }

    params.push('--')

    git = exec.spawnSync(git_command, params)

    if (git.status !== 0) {
        logger.debug("Can't get commit message.")
        return
    }

    return git.stdout
}

export function getConfig(key) {
    var git = exec.spawnSync(git_command, ['config', '--get', key])

    if (git.status !== 0) {
        throw new Error(`No git config found for ${key}\n`)
    }

    return git.stdout
}

export function getCurrentBranch() {
    if (testing) {
        return 'master'
    }

    var git = exec.spawnSync(git_command, ['symbolic-ref', '--short', 'HEAD'])

    if (git.status !== 0) {
        logger.debug("Can't get current branch.")
        return
    }

    return git.stdout
}

export function getLastCommitMessage(branch) {
    return getCommitMessage(branch, 1)
}

export function getLastCommitSHA() {
    var git = exec.spawnSync(git_command, ['rev-parse', '--short', 'HEAD'])

    if (git.status !== 0) {
        throw new Error("Can't retrieve last commit.")
    }

    return git.stdout
}

export function getRemoteUrl(remote) {
    try {
        return getConfig(`remote.${remote}.url`)
    } catch (e) {
        logger.debug("Can't get remote URL.")
        return
    }
}

export function getRepoFromRemoteURL(url) {
    var parsed = parseRemoteUrl(url)

    return parsed && parsed[1]
}

export function getUserFromRemoteUrl(url) {
    var parsed = parseRemoteUrl(url)

    return parsed && parsed[0]
}

export function getRepo(remote) {
    return getRepoFromRemoteURL(getRemoteUrl(remote))
}

export function getUser(remote) {
    return getUserFromRemoteUrl(getRemoteUrl(remote))
}

export function parseRemoteUrl(url) {
    var parsed = /[\/:]([\w-]+)\/(.*?)(?:\.git)?$/.exec(url)

    if (parsed) {
        parsed.shift()
    }

    return parsed
}
