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
import { userRanValidFlags, userLeftMsgEmpty, openFileInEditor } from '../../utils'
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
const FETCH_TYPE_SILENT = 'silent'
const STATE_CLOSED = 'closed'
const STATE_OPEN = 'open'

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
            await _submitHandler(options)
        }
    }
}

async function close(options) {
    const { data: pull } = await getPullRequest(options)

    const data = await updatePullRequest_(options, pull.title, pull.body, STATE_CLOSED)

    if (options.pullBranch === options.currentBranch) {
        git.checkout(pull.base.ref)
    }

    if (options.pullBranch) {
        git.deleteBranch(options.pullBranch)
    }

    return data
}

async function comment(options) {
    const useEditor = options.config.use_editor !== false

    let body =
        logger.applyReplacements(options.comment, options.config.replace) + options.config.signature

    if (useEditor && userLeftMsgEmpty(body)) {
        body = openFileInEditor(
            'temp-gh-pr-comment.md',
            '<!-- Add an pr comment message in markdown format below -->'
        )
    }

    const payload = {
        body,
        issue_number: options.number,
        repo: options.repo,
        owner: options.user,
    }

    return options.GitHub.issues.createComment(payload)
}

async function checkPullRequestIntegrity_(options, originalError) {
    let pull

    const payload = {
        owner: options.user,
        repo: options.repo,
        state: STATE_OPEN,
    }

    try {
        var pulls = await options.GitHub.paginate(options.GitHub.pulls.list.endpoint(payload))
    } catch (err) {
        throw new Error(`Error listings PRs\n${err}`)
    }

    pulls.forEach(data => {
        if (
            data.base.ref === options.branch &&
            data.head.ref === options.currentBranch &&
            data.base.sha === data.head.sha &&
            data.base.user.login === options.user &&
            data.head.user.login === options.user
        ) {
            pull = data
            originalError = null
            return
        }
    })

    return {
        originalError,
        pull,
    }
}

async function fetch(options, optType) {
    try {
        var { data: pull } = await getPullRequest(options)
    } catch (err) {
        throw new Error(`Error getting PR\n${err}`)
    }

    const headBranch = pull.head.ref
    const repoUrl = options.config.ssh === false ? pull.head.repo.clone_url : pull.head.repo.ssh_url

    git.fetch(repoUrl, headBranch, options.pullBranch)

    if (optType !== FETCH_TYPE_SILENT) {
        git[optType](options.pullBranch)
    }

    return pull
}

async function forward(options) {
    try {
        var pull = await fetch(options, FETCH_TYPE_SILENT)
    } catch (err) {
        throw new Error(`Error fetching PR\${err}`)
    }

    options = produce(options, draft => {
        draft.title = pull.title
        draft.description = pull.body
        draft.submittedUser = pull.user.login
    })

    const data = await submit(options, options.fwd)

    return { data, options }
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

async function open(options) {
    const { data: pull } = await getPullRequest(options)

    return updatePullRequest_(options, pull.title, pull.body, STATE_OPEN)
}

function setMergeCommentRequiredOptions_(options) {
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

async function submit(options, user) {
    const useEditor = options.config.use_editor !== false
    let description = options.description
    let title = options.title
    let pullBranch = options.pullBranch || options.currentBranch

    if (testing) {
        pullBranch = 'test'
    }

    if (userLeftMsgEmpty(title)) {
        title = useEditor
            ? openFileInEditor('temp-gh-pr-title.txt', `# Add a pr title message on the next line`)
            : git.getLastCommitMessage(pullBranch)
    }

    // If user passes an empty title and description, --description will get merged into options.title
    // Need to reference the original title not the potentially modified one
    if (useEditor && (userLeftMsgEmpty(options.title) || userLeftMsgEmpty(description))) {
        description = openFileInEditor(
            'temp-gh-pr-body.md',
            '<!-- Add an pr body message in markdown format below -->'
        )
    }

    const payload: any = {
        mediaType: {
            previews: ['shadow-cat'],
        },
        owner: user,
        base: options.branch,
        head: `${options.user}:${pullBranch}`,
        repo: options.repo,
        title: title,
        ...(options.issue ? { issue: options.issue } : {}),
        ...(options.draft ? { draft: options.draft } : {}),
        ...(description ? { body: description } : {}),
    }

    try {
        git.push(options.config.default_remote, pullBranch)

        const method = payload.issue ? 'createFromIssue' : 'create'

        var { data } = await options.GitHub.pulls[method](payload)
    } catch (err) {
        var { originalError, pull } = await checkPullRequestIntegrity_(options, err)

        if (originalError) {
            throw new Error(`Error submitting PR\n${err}`)
        }
    }

    return data || pull
}

function updatePullRequest_(options, title, optBody, state) {
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

    options = setMergeCommentRequiredOptions_(options)

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

    options = setMergeCommentRequiredOptions_(options)

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

async function _submitHandler(options) {
    await beforeHooks('pull-request.submit', { options })

    logger.log(`Submitting pull request to ${logger.colors.magenta(`@${options.submit}`)}`)

    try {
        var pull = await submit(options, options.submit)
    } catch (err) {
        throw new Error(`Can't submit pull request\n${err}`)
    }

    if (pull.draft) {
        logger.log('Opened in draft state.')
    }

    if (pull) {
        options = produce(options, draft => {
            draft.submittedPull = pull.number
        })
    }

    logger.log(pull.html_url)

    options = setMergeCommentRequiredOptions_(options)

    await afterHooks('pull-request.submit', { options })
}
