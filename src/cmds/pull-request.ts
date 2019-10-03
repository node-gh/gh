/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as Table from 'cli-table3'
import { startsWith } from 'lodash'
import * as marked from 'marked'
import { produce } from 'immer'
import * as TerminalRenderer from 'marked-terminal'
import { openUrl, userRanValidFlags } from '../utils'
import * as wrap from 'wordwrap'
import * as base from '../base'
import * as git from '../git'

import { afterHooks, beforeHooks } from '../hooks'
import * as logger from '../logger'

const config = base.getConfig()
const testing = process.env.NODE_ENV === 'testing'

const STATUSES = {
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

const DIRECTION_DESC = 'desc'
const DIRECTION_ASC = 'asc'
const FETCH_TYPE_CHECKOUT = 'checkout'
const FETCH_TYPE_MERGE = 'merge'
const FETCH_TYPE_REBASE = 'rebase'
const FETCH_TYPE_SILENT = 'silent'
const SORT_CREATED = 'created'
const SORT_COMPLEXITY = 'complexity'
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
        await main(number)
    }

    done && done()

    // main logic to iterate on when number flag is passed in > 1
    async function main(number) {
        options = await produce(options, async draft => {
            draft.number =
                number ||
                getPullRequestNumberFromBranch_(draft.currentBranch, config.pull_branch_name_prefix)

            draft.pullBranch = getBranchNameFromPullNumber_(number)
            draft.state = draft.state || STATE_OPEN
        })

        if (!options.pullBranch && (options.close || options.fetch || options.merge)) {
            logger.error("You've invoked a method that requires an issue number.")
        }

        if (options.browser) {
            browser(options.user, options.repo, number)
        }

        if (!options.list) {
            options = produce(options, draft => {
                draft.branch = draft.branch || config.default_branch
            })
        }

        if (options.close) {
            try {
                await _closeHandler(options)
            } catch (err) {
                throw new Error(`Error closing PR\n${err}`)
            }
        }

        if (options.comment) {
            await _commentHandler(options)
        }

        if (options.fetch) {
            await _fetchHandler(options)
        }

        if (options.fwd === '') {
            options = produce(options, draft => {
                draft.fwd = config.default_pr_forwarder
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
            await _listHandler(options)
        }

        if (options.open) {
            await _openHandler(options)
        }

        if (options.submit === '') {
            options = produce(options, draft => {
                draft.submit = config.default_pr_reviewer
            })
        }

        if (options.submit) {
            await _submitHandler(options)
        }
    }
}

async function addComplexityParamToPulls_(options, pulls) {
    return Promise.all(
        pulls.map(async pull => {
            options = produce(options, draft => {
                draft.number = pull.number
            })

            try {
                var { data } = await getPullRequest_(options)
            } catch (err) {
                throw new Error(`Error getting PR\n${err}`)
            }

            const metrics = {
                additions: data.additions,
                changedFiles: data.changed_files,
                comments: data.comments,
                deletions: data.deletions,
                reviewComments: data.review_comments,
            }

            pull.complexity = calculateComplexity_(metrics)

            return pull
        })
    )
}

function browser(user, repo, number) {
    if (number) {
        openUrl(`${config.github_host}/${user}/${repo}/pull/${number}`)
    } else {
        openUrl(`${config.github_host}/${user}/${repo}/pulls`)
    }
}

function calculateComplexity_(metrics): number {
    const weightAddition = 2
    const weightChangedFile = 2
    const weightComment = 2
    const weightDeletion = 2
    const weightReviewComment = 1

    const complexity =
        metrics.additions * weightAddition +
        metrics.changedFiles * weightChangedFile +
        metrics.comments * weightComment +
        metrics.deletions * weightDeletion +
        metrics.reviewComments * weightReviewComment

    return complexity
}

async function close(options) {
    const { data: pull } = await getPullRequest_(options)

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
    const body = logger.applyReplacements(options.comment, config.replace) + config.signature

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

async function fetch(options, opt_type) {
    try {
        var { data: pull } = await getPullRequest_(options)
    } catch (err) {
        throw new Error(`Error getting PR\n${err}`)
    }

    const headBranch = pull.head.ref
    const repoUrl = config.ssh === false ? pull.head.repo.clone_url : pull.head.repo.ssh_url

    git.fetch(repoUrl, headBranch, options.pullBranch)

    if (opt_type !== FETCH_TYPE_SILENT) {
        git[opt_type](options.pullBranch)
    }

    return pull
}

function filterPullsSentByMe_(options, pulls) {
    return pulls.filter(pull => {
        if (options.loggedUser === pull.user.login) {
            return pull
        }
    })
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

function getPullRequest_(options) {
    const payload = {
        pull_number: options.number,
        repo: options.repo,
        owner: options.user,
    }

    return options.GitHub.pulls.get(payload)
}

function getBranchNameFromPullNumber_(number) {
    if (number && number[0] !== undefined) {
        return config.pull_branch_name_prefix + number
    }
}

function getPullRequestNumberFromBranch_(currentBranch, prefix) {
    if (currentBranch && startsWith(currentBranch, prefix)) {
        return currentBranch.replace(prefix, '')
    }
}

function getPullsTemplateJson_(options, pulls) {
    let branch

    const branches = {}
    const json = {
        branches: [],
    }

    pulls.forEach(pull => {
        branch = pull.base.ref

        if (!options.branch || options.branch === branch) {
            branches[branch] = branches[branch] || []
            branches[branch].push(pull)
        }
    })

    Object.keys(branches).forEach(branch => {
        json.branches.push({
            name: branch,
            pulls: branches[branch],
            total: branches[branch].length,
        })
    })

    return json
}

function printPullsInfoTable_(options, pulls) {
    const showDetails = options.info || options.detailed

    logger.log(generateTable())

    function generateTable(): string {
        const isCompact = process.stdout.columns < 100 && !testing

        const tableWidths = getColWidths(isCompact)

        const table = new Table({
            colWidths: tableWidths,
        }) as Table.HorizontalTable

        type TCell = (
            | string
            | {
                  content: string
                  hAlign: Table.HorizontalAlignment
              })[]

        let tableHead: TCell = [
            { content: '#', hAlign: 'center' },
            showDetails ? 'Details' : 'Title',
            'Author',
            'Opened',
            'Status',
        ]

        if (isCompact) {
            tableHead = remove2ndItem(tableHead)
        }

        tableHead = tableHead.map(heading => {
            if (typeof heading === 'string') {
                return logger.colors.red(heading)
            }

            return { content: logger.colors.red(heading.content), hAlign: heading.hAlign }
        })

        table.push(tableHead)

        pulls.forEach(pull => {
            const { createdTime, number, prInfo, user, status } = getColorizedFields(
                pull,
                isCompact ? getTotalWidth() : tableWidths[1],
                options.date
            )

            const body: TCell = [
                { content: number, hAlign: 'center' },
                prInfo,
                user,
                createdTime,
                { content: status, hAlign: 'center' },
            ]

            if (isCompact) {
                table.push(remove2ndItem(body))

                const titleLabel = showDetails ? '' : logger.colors.blue('Title:')

                table.push([{ colSpan: 4, content: `${titleLabel} ${prInfo}\n`.trim() }])
            } else {
                table.push(body)
            }
        })

        return table.toString()
    }

    function getColorizedFields(pull, length, dateFormatter) {
        const createdTime = logger.getDuration(pull.created_at, dateFormatter)
        const number = logger.colors.green(`#${pull.number}`)
        const prInfo = formatPrInfo(pull, length)
        const user = logger.colors.magenta(`@${pull.user.login}`)
        const status = STATUSES[pull.combinedStatus]

        return { createdTime, number, prInfo, user, status }
    }

    function getTotalWidth(): number {
        const padding = 6
        const terminalCols = process.stdout.columns - padding
        return testing ? 100 : terminalCols
    }

    function getColWidths(compact: boolean): number[] {
        const totalWidth = getTotalWidth()
        const dateCol = 15
        const noCol = 9
        const statusCol = 8

        const authorCol = compact ? totalWidth - dateCol - noCol - statusCol : 21
        const titleCol = totalWidth - authorCol - dateCol - noCol - statusCol

        let colWidths = [noCol, titleCol, authorCol, dateCol, statusCol]

        if (compact) {
            colWidths = remove2ndItem(colWidths)
        }

        return colWidths.map(col => Math.floor(col))
    }

    function formatPrInfo(pull, length) {
        const paddedLength = length - 5
        const title = wrap(paddedLength)(pull.title)

        const labels = pull.labels.length > 0 && pull.labels.map(label => label.name).join(', ')
        const singularOrPlural = labels && pull.labels.length > 1 ? 's' : ''
        const formattedLabels = labels
            ? logger.colors.yellow(`\nLabel${singularOrPlural}: ${labels}`)
            : ''

        let info = `${title}${formattedLabels}`

        if (showDetails) {
            marked.setOptions({
                renderer: new TerminalRenderer({
                    reflowText: true,
                    width: paddedLength,
                }),
            })

            info = `
                ${logger.colors.blue('Title:')}

                ${title}

                ${formattedLabels.split('\n')[1] || ''}

                ${logger.colors.blue('Body:')}

                ${marked(pull.body || 'N/A')}
            `
        }

        if (options.link || showDetails) {
            info = `
                ${info}
                ${logger.colors.cyan(pull.html_url)}
            `
        }

        return info
            .replace(/  +/gm, '')
            .replace(/(\n\n\n)/gm, '\n')
            .trim()
    }

    function remove2ndItem(arr: any[]): any[] {
        return [arr[0], ...arr.slice(2)]
    }
}

function printPullInfo_(options, pull) {
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

    printPullInfo_(options, pull)
}

async function list(options, user, repo) {
    let json

    await beforeHooks('pull-request.list', { options })

    let sort = options.sort

    if (options.sort === SORT_COMPLEXITY) {
        sort = SORT_CREATED
    }

    const payload = {
        repo,
        sort,
        owner: user,
        direction: options.direction,
        state: options.state,
    }

    try {
        var data = await options.GitHub.paginate(options.GitHub.pulls.list.endpoint(payload))
    } catch (err) {
        if (err && err.status === '404') {
            // some times a repo is found, but you can't listen its prs
            // due to the repo being disabled (e.g., private repo with debt)
            logger.warn(`Can't list pull requests for ${user}/${payload.repo}`)
        } else {
            throw new Error(`Error listing pulls\n${err}`)
        }
    }

    let pulls = []

    if (options.me) {
        pulls = filterPullsSentByMe_(options, data)
    } else {
        pulls = data
    }

    if (options.sort && options.sort === SORT_COMPLEXITY) {
        try {
            pulls = await addComplexityParamToPulls_(options, pulls)
        } catch (err) {
            throw new Error(`Error sorting by complexity\n${err}`)
        }

        pulls = sortPullsByComplexity_(pulls, options.direction)
    }

    pulls = await Promise.all(
        pulls.map(async pull => {
            const statusPayload = {
                repo,
                owner: user,
                ref: pull.head.sha,
            }

            try {
                var { data } = await options.GitHub.repos.getCombinedStatusForRef(statusPayload)
            } catch (err) {
                throw new Error(`Error getting combined status for ref\n${err}`)
            }

            return { ...pull, combinedStatus: data.state }
        })
    )

    json = getPullsTemplateJson_(options, pulls)

    if (pulls.length) {
        logger.log(logger.colors.yellow(`${user}/${repo}`))

        json.branches.forEach((branch, index, arr) => {
            logger.log(`${logger.colors.blue('Branch:')} ${branch.name} (${branch.total})`)

            const printTableView = config.pretty_print === undefined || Boolean(config.pretty_print)

            if (printTableView) {
                printPullsInfoTable_(options, branch.pulls)
            } else {
                branch.pulls.forEach(printPullInfo_)
            }

            if (index !== arr.length - 1) {
                logger.log('')
            }
        })

        if (options.all) {
            logger.log('')
        }
    }

    await afterHooks('pull-request.list', { options })
}

async function listFromAllRepositories(options) {
    let payload
    let apiMethod

    payload = {
        type: 'all',
        owner: options.user,
        per_page: 100,
    }

    if (options.org) {
        apiMethod = 'listForOrg'
        payload.org = options.org
    } else {
        apiMethod = 'listForUser'
        payload.username = options.user
    }

    try {
        var repositories = await options.GitHub.paginate(
            options.GitHub.repos[apiMethod].endpoint(payload)
        )
    } catch (err) {
        throw new Error(`Error listing repos`)
    }

    return Promise.all(
        repositories.map(repository => {
            list(options, repository.owner.login, repository.name)
        })
    )
}

async function open(options) {
    const { data: pull } = await getPullRequest_(options)

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

function sortPullsByComplexity_(pulls, direction) {
    pulls.sort((a, b) => {
        if (a.complexity > b.complexity) {
            return -1
        }

        if (a.complexity < b.complexity) {
            return +1
        }

        return 0
    })

    if (direction === DIRECTION_ASC) {
        pulls.reverse()
    }

    return pulls
}

async function submit(options, user) {
    let pullBranch = options.pullBranch || options.currentBranch

    if (testing) {
        pullBranch = 'test'
    }

    git.push(config.default_remote, pullBranch)

    var payload: any = {
        owner: user,
        base: options.branch,
        head: `${options.user}:${pullBranch}`,
        repo: options.repo,
        mediaType: {
            previews: ['shadow-cat'],
        },
        ...(options.draft ? { draft: options.draft } : {}),
    }

    try {
        if (options.issue) {
            payload.issue = options.issue
            var { data } = await options.GitHub.pulls.createFromIssue(payload)
        } else {
            payload.body = options.description
            payload.title = options.title || git.getLastCommitMessage(pullBranch)

            var { data } = await options.GitHub.pulls.create(payload)
        }
    } catch (err) {
        var { originalError, pull } = await checkPullRequestIntegrity_(options, err)

        if (originalError) {
            throw new Error(`Error submitting PR\n${err}`)
        }
    }

    return data || pull
}

function updatePullRequest_(options, title, opt_body, state) {
    if (opt_body) {
        opt_body = logger.applyReplacements(opt_body, config.replace)
    }

    const payload = {
        state,
        title,
        pull_number: options.number,
        repo: options.repo,
        owner: options.user,
        ...(opt_body ? { body: opt_body } : {}),
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

async function _listHandler(options) {
    let who

    options = produce(options, draft => {
        draft.sort = draft.sort || SORT_CREATED
        draft.direction = draft.direction || DIRECTION_DESC
    })

    if (options.all) {
        who = options.user

        if (options.org) {
            who = options.org
        }

        logger.log(`Listing all ${options.state} pull requests for ${logger.colors.green(who)}`)

        try {
            await listFromAllRepositories(options)
        } catch (err) {
            throw new Error(`Can't list all pull requests from repos.\n${err}`)
        }
    } else {
        if (options.me) {
            logger.log(
                `Listing ${options.state} pull requests sent by ${logger.colors.green(
                    options.loggedUser
                )} on ${logger.colors.green(`${options.user}/${options.repo}`)}`
            )
        } else {
            logger.log(
                `Listing ${options.state} pull requests on ${logger.colors.green(
                    `${options.user}/${options.repo}`
                )}`
            )
        }

        try {
            await list(options, options.user, options.repo)
        } catch (err) {
            throw new Error(`Can't list pull requests.\n${err}`)
        }
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

    if (pull) {
        options = produce(options, draft => {
            draft.submittedPull = pull.number
        })
    }

    logger.log(pull.html_url)

    options = setMergeCommentRequiredOptions_(options)

    await afterHooks('pull-request.submit', { options })
}
