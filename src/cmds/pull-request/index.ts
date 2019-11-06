/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import { startsWith } from 'lodash'
import { produce } from 'immer'
import { listHandler } from './list'
import { browser } from './browser'
import { close } from './close'
import { open } from './open'
import { comment } from './comment'
import { submitHandler } from './submit'
import { fetch } from './fetch'
import { forward } from './forward'
import { userRanValidFlags } from '../../utils'
import * as git from '../../git'

import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'

export const testing = process.env.NODE_ENV === 'testing'

export const STATUSES = {
    error: logger.colors.red('!'),
    failure: logger.colors.red('✗'),
    pending: logger.colors.yellow('-'),
    success: logger.colors.green('✓'),
}

// -- Constants ------------------------------------------------------------------------------------

export const name = 'PullRequest'
export const DETAILS = {
    alias: 'pr',
    description: 'Provides a set of util commands to work with Pull Requests.',
    iterative: 'number',
    commands: [
        'browser',
        'close',
        'comment',
        'fetch',
        'fwd',
        'info',
        'list',
        'merge',
        'open',
        'rebase',
        'submit',
    ],
    options: {
        all: Boolean,
        branch: String,
        browser: Boolean,
        close: Boolean,
        comment: String,
        date: String,
        description: String,
        detailed: Boolean,
        direction: String,
        draft: Boolean,
        fetch: Boolean,
        fwd: String,
        issue: Number,
        info: Boolean,
        link: Boolean,
        list: Boolean,
        me: Boolean,
        merge: Boolean,
        number: [String, Array],
        open: Boolean,
        org: String,
        rebase: Boolean,
        remote: String,
        repo: String,
        sort: String,
        state: ['open', 'closed'],
        submit: String,
        title: String,
        user: String,
    },
    shorthands: {
        a: ['--all'],
        b: ['--branch'],
        B: ['--browser'],
        C: ['--close'],
        c: ['--comment'],
        D: ['--description'],
        d: ['--detailed'],
        f: ['--fetch'],
        i: ['--issue'],
        I: ['--info'],
        k: ['--link'],
        l: ['--list'],
        M: ['--merge'],
        m: ['--me'],
        n: ['--number'],
        o: ['--open'],
        O: ['--org'],
        R: ['--rebase'],
        r: ['--repo'],
        S: ['--state'],
        s: ['--submit'],
        t: ['--title'],
        u: ['--user'],
    },
}

const FETCH_TYPE_CHECKOUT = 'checkout'
const FETCH_TYPE_MERGE = 'merge'
const FETCH_TYPE_REBASE = 'rebase'
export const FETCH_TYPE_SILENT = 'silent'
export const STATE_OPEN = 'open'

// -- Commands -------------------------------------------------------------------------------------

export async function run(options, done) {
    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command')
    }

    if (!userRanValidFlags(DETAILS.commands, options)) {
        const payload = options.argv.remain && options.argv.remain.concat().slice(1)

        options = produce(options, draft => {
            if (payload && payload[0]) {
                draft.fetch = true
            } else {
                draft.list = true
            }
        })
    }

    const numbers = [...options.number]

    for (const number of numbers) {
        await main(number, options)
    }

    done && done()

    // main logic to iterate on when number flag is passed in > 1
    async function main(number, options) {
        options = await produce(options, async draft => {
            draft.number =
                number ||
                getPullRequestNumberFromBranch_(
                    draft.currentBranch,
                    options.config.pull_branch_name_prefix
                )

            draft.pullBranch = getBranchNameFromPullNumber_(
                number,
                options.config.pull_branch_name_prefix
            )
            draft.state = draft.state || STATE_OPEN
        })

        if (!options.pullBranch && (options.close || options.fetch || options.merge)) {
            logger.error("You've invoked a method that requires an issue number.")
        }

        if (options.browser) {
            browser(options.user, options.repo, number, options.config.github_host)
        }

        if (!options.list) {
            options = produce(options, draft => {
                draft.branch = draft.branch || options.config.default_branch
            })
        }

        if (options.close) {
            try {
                await _closeHandler(options)
            } catch (err) {
                throw new Error(`Error closing PR\n${err}`)
            }
        }

        if (options.comment || options.comment === '') {
            await _commentHandler(options)
        }

        if (options.fetch) {
            await _fetchHandler(options)
        }

        if (options.fwd === '') {
            options = produce(options, draft => {
                draft.fwd = options.config.default_pr_forwarder
            })
        }

        if (options.fwd) {
            await _fwdHandler(options)
            return
        }

        if (options.info) {
            await _infoHandler(options)
        }

        if (options.list) {
            await listHandler(options)
        }

        if (options.open) {
            await _openHandler(options)
        }

        if (options.submit === '') {
            options = produce(options, draft => {
                draft.submit = options.config.default_pr_reviewer
            })
        }

        if (options.submit) {
            await submitHandler(options)
        }
    }
}

export function getPullRequest(options) {
    const payload = {
        pull_number: options.number,
        repo: options.repo,
        owner: options.user,
    }

    return options.GitHub.pulls.get(payload)
}

function getBranchNameFromPullNumber_(number, pullBranchNamePrefix) {
    if (number && number[0] !== undefined) {
        return pullBranchNamePrefix + number
    }
}

function getPullRequestNumberFromBranch_(currentBranch, prefix) {
    if (currentBranch && startsWith(currentBranch, prefix)) {
        return currentBranch.replace(prefix, '')
    }
}

export function printPullInfo(options, pull) {
    let status = ''

    switch (pull.combinedStatus) {
        case 'success':
        case 'failure':
        case 'error':
            status = ` ${STATUSES[pull.combinedStatus]}`
            break
    }

    var headline = `${logger.colors.green(`#${pull.number}`)} ${pull.title} ${logger.colors.magenta(
        `@${pull.user.login}`
    )} (${logger.getDuration(pull.created_at, options.date)})${status}`

    if (options.link) {
        headline += ` ${logger.colors.blue(pull.html_url)}`
    }

    logger.log(headline)

    if (options.detailed && !options.link) {
        logger.log(logger.colors.blue(pull.html_url))
    }

    if (pull.mergeable_state === 'clean') {
        logger.log(`Mergeable (${pull.mergeable_state})`)
    } else if (pull.mergeable_state !== undefined) {
        logger.warn(`Not mergeable (${pull.mergeable_state})`)
    }

    if ((options.info || options.detailed) && pull.body) {
        logger.log(`${pull.body}\n`)
    }
}

async function get(options, user, repo, number) {
    const payload = {
        repo,
        pull_number: number,
        owner: user,
    }

    try {
        var { data: pull } = await options.GitHub.pulls.get(payload)
    } catch (err) {
        logger.warn(`Can't get pull request ${user}/${repo}/${number}`)
    }

    printPullInfo(options, pull)
}

export function setMergeCommentRequiredOptions(options) {
    const lastCommitSHA = git.getLastCommitSHA()
    const changes = git.countUserAdjacentCommits()

    options = produce(options, draft => {
        draft.currentSHA = lastCommitSHA

        if (changes > 0) {
            draft.changes = changes
        }

        draft.pullHeadSHA = `${lastCommitSHA}~${changes}`
    })

    return options
}

export function updatePullRequest(options, title, optBody, state) {
    if (optBody) {
        optBody = logger.applyReplacements(optBody, options.config.replace)
    }

    const payload = {
        state,
        title,
        pull_number: options.number,
        repo: options.repo,
        owner: options.user,
        ...(optBody ? { body: optBody } : {}),
    }

    return options.GitHub.pulls.update(payload)
}

async function _fetchHandler(options) {
    let fetchType = FETCH_TYPE_CHECKOUT

    if (options.merge) {
        fetchType = FETCH_TYPE_MERGE
    } else if (options.rebase) {
        fetchType = FETCH_TYPE_REBASE
    }

    await beforeHooks('pull-request.fetch', { options })

    let operation = ''
    let branch = options.pullBranch

    if (options.merge) {
        operation = ' and merging'
        branch = options.currentBranch
    }

    if (options.rebase) {
        operation = ' and rebasing'
        branch = options.currentBranch
    }

    logger.log(
        `Fetching pull request ${logger.colors.green(
            `#${options.number}`
        )}${operation} into branch ${logger.colors.green(branch)}`
    )

    try {
        await fetch(options, fetchType)
    } catch (err) {
        throw new Error(`Can't fetch pull request ${options.number}.\n${err}`)
    }

    await afterHooks('pull-request.fetch', { options })
}

async function _fwdHandler(options) {
    await beforeHooks('pull-request.fwd', { options })

    logger.log(
        `Forwarding pull request ${logger.colors.green(
            `#${options.number}`
        )} to ${logger.colors.magenta(`@${options.fwd}`)}`
    )

    try {
        var { options: updatedOptions, data: pull } = await forward(options)
    } catch (err) {
        throw new Error(`Can't forward pull request ${options.number} to ${options.fwd}.\n${err}`)
    }

    if (pull) {
        options = produce(updatedOptions, draft => {
            draft.submittedPullNumber = pull.number
            draft.forwardedPull = pull.number
        })
    }

    logger.log(pull.html_url)

    options = setMergeCommentRequiredOptions(options)

    await afterHooks('pull-request.fwd', { options })
}

async function _closeHandler(options) {
    await beforeHooks('pull-request.close', { options })

    logger.log(`Closing pull request ${logger.colors.green(`#${options.number}`)}`)

    try {
        var { data } = await close(options)
    } catch (err) {
        throw new Error(`Can't close pull request ${options.number}.\n${err}`)
    }

    logger.log(data.html_url)

    options = setMergeCommentRequiredOptions(options)

    await afterHooks('pull-request.close', { options })
}

async function _commentHandler(options) {
    logger.log(`Adding comment on pull request ${logger.colors.green(`#${options.number}`)}`)

    try {
        var { data } = await comment(options)
    } catch (err) {
        throw new Error(`Can't comment on pull request ${options.number}.\n${err}`)
    }

    logger.log(data.html_url)
}

async function _infoHandler(options) {
    try {
        await get(options, options.user, options.repo, options.number)
    } catch (err) {
        throw new Error(`Can't get pull requests.\n${err}`)
    }
}

async function _openHandler(options) {
    await beforeHooks('pull-request.open', { options })

    logger.log(`Opening pull request ${logger.colors.green(`#${options.number}`)}`)

    try {
        var { data } = await open(options)
    } catch (err) {
        logger.error(`Can't open pull request ${options.number}.`)
    }

    logger.log(data.html_url)

    await afterHooks('pull-request.open', { options })
}
