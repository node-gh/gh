/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as Table from 'cli-table3'
import { startsWith } from 'lodash'
import * as marked from 'marked'
import * as TerminalRenderer from 'marked-terminal'
import * as openUrl from 'opn'
import * as wrap from 'wordwrap'
import * as base from '../base'
import * as git from '../git'
import { getGitHubInstance } from '../github'
import { afterHooks, beforeHooks } from '../hooks'
import * as logger from '../logger'
import { hasCmdInOptions } from '../utils'

const config = base.getConfig()
const testing = process.env.NODE_ENV === 'testing'

const STATUSES = {
    error: logger.colors.red('!'),
    failure: logger.colors.red('✗'),
    pending: logger.colors.yellow('-'),
    success: logger.colors.green('✓'),
}

// -- Constructor ----------------------------------------------------------------------------------

export default function PullRequest(options) {
    this.options = options

    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command')
    }
}

// -- Constants ------------------------------------------------------------------------------------

PullRequest.DETAILS = {
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

PullRequest.DIRECTION_DESC = 'desc'
PullRequest.DIRECTION_ASC = 'asc'
PullRequest.FETCH_TYPE_CHECKOUT = 'checkout'
PullRequest.FETCH_TYPE_MERGE = 'merge'
PullRequest.FETCH_TYPE_REBASE = 'rebase'
PullRequest.FETCH_TYPE_SILENT = 'silent'
PullRequest.SORT_CREATED = 'created'
PullRequest.SORT_COMPLEXITY = 'complexity'
PullRequest.STATE_CLOSED = 'closed'
PullRequest.STATE_OPEN = 'open'

// -- Commands -------------------------------------------------------------------------------------

PullRequest.prototype.options = null

PullRequest.prototype.issues = null

PullRequest.prototype.run = async function(done) {
    const instance = this
    const options = instance.options

    instance.config = config
    instance.GitHub = await getGitHubInstance()

    if (!hasCmdInOptions(PullRequest.DETAILS.commands, options)) {
        const payload = options.argv.remain && options.argv.remain.concat().slice(1)

        if (payload && payload[0]) {
            options.fetch = true
        } else {
            options.list = true
        }
    }

    options.number =
        options.number ||
        instance.getPullRequestNumberFromBranch_(
            options.currentBranch,
            config.pull_branch_name_prefix
        )

    options.pullBranch = instance.getBranchNameFromPullNumber_(options.number)
    options.state = options.state || PullRequest.STATE_OPEN

    if (!options.pullBranch && (options.close || options.fetch || options.merge)) {
        logger.error("You've invoked a method that requires an issue number.")
    }

    if (options.browser && !testing) {
        instance.browser(options.user, options.repo, options.number)
    }

    if (!options.list) {
        options.branch = options.branch || config.default_branch
    }

    if (options.close) {
        try {
            await instance._closeHandler()
        } catch (err) {
            throw new Error(`Error closing PR\n${err}`)
        }
    }

    if (options.comment) {
        await instance._commentHandler()
    }

    if (options.fetch) {
        await instance._fetchHandler()
    }

    if (options.fwd === '') {
        options.fwd = config.default_pr_forwarder
    }

    if (options.fwd) {
        await this._fwdHandler()
    }

    if (options.info) {
        await this._infoHandler()
    }

    if (options.list) {
        await this._listHandler()
    }

    if (options.open) {
        await this._openHandler()
    }

    if (options.submit === '') {
        options.submit = config.default_pr_reviewer
    }

    if (options.submit) {
        await this._submitHandler()
    }

    done && done()
}

PullRequest.prototype.addComplexityParamToPulls_ = async function(pulls) {
    const instance = this
    const options = instance.options

    return Promise.all(
        pulls.map(async pull => {
            options.number = pull.number

            try {
                var { data } = await instance.getPullRequest_()
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

            pull.complexity = instance.calculateComplexity_(metrics)
        })
    )
}

PullRequest.prototype.browser = function(user, repo, number) {
    if (number) {
        openUrl(`${config.github_host}/${user}/${repo}/pull/${number}`, { wait: false })
    } else {
        openUrl(`${config.github_host}/${user}/${repo}/pulls`, { wait: false })
    }
}

PullRequest.prototype.calculateComplexity_ = function(metrics): number {
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

PullRequest.prototype.close = async function() {
    const instance = this
    const options = instance.options

    const { data: pull } = await instance.getPullRequest_()

    const data = await instance.updatePullRequest_(pull.title, pull.body, PullRequest.STATE_CLOSED)

    if (options.pullBranch === options.currentBranch) {
        git.checkout(pull.base.ref)
    }

    if (options.pullBranch) {
        git.deleteBranch(options.pullBranch)
    }

    return data
}

PullRequest.prototype.comment = async function() {
    const instance = this
    const options = instance.options
    const body = logger.applyReplacements(options.comment, config.replace) + config.signature

    const payload = {
        body,
        issue_number: options.number,
        repo: options.repo,
        owner: options.user,
    }

    return instance.GitHub.issues.createComment(payload)
}

PullRequest.prototype.checkPullRequestIntegrity_ = async function(originalError, user) {
    const instance = this
    const options = instance.options
    let pull

    const payload = {
        owner: user,
        repo: options.repo,
        state: PullRequest.STATE_OPEN,
    }

    try {
        var { data: pulls } = await instance.GitHub.pulls.list(payload)
    } catch (err) {
        throw new Error(`Error listings PRs\n${err}`)
    }

    pulls.forEach(data => {
        if (
            data.base.ref === options.branch &&
            data.head.ref === options.currentBranch &&
            data.base.sha === data.head.sha &&
            data.base.user.login === user &&
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

PullRequest.prototype.fetch = async function(opt_type) {
    const instance = this
    const options = instance.options

    try {
        var { data: pull } = await instance.getPullRequest_()
    } catch (err) {
        throw new Error(`Error getting PR\n${err}`)
    }

    const headBranch = pull.head.ref
    const repoUrl = config.ssh === false ? pull.head.repo.clone_url : pull.head.repo.ssh_url

    git.fetch(repoUrl, headBranch, options.pullBranch)

    if (opt_type !== PullRequest.FETCH_TYPE_SILENT) {
        git[opt_type](options.pullBranch)
    }

    return pull
}

PullRequest.prototype.filterPullsSentByMe_ = function(pulls) {
    const instance = this
    const options = instance.options

    return pulls.filter(pull => {
        if (options.loggedUser === pull.user.login) {
            return pull
        }
    })
}

PullRequest.prototype.forward = async function() {
    const instance = this
    const options = instance.options

    const { data: pull } = await instance.fetch(PullRequest.FETCH_TYPE_SILENT)

    options.title = pull.title
    options.description = pull.body
    options.submittedUser = pull.user.login

    return instance.submit(options.fwd)
}

PullRequest.prototype.getPullRequest_ = function() {
    const instance = this
    const options = instance.options

    const payload = {
        pull_number: options.number,
        repo: options.repo,
        owner: options.user,
    }

    return instance.GitHub.pulls.get(payload)
}

PullRequest.prototype.getBranchNameFromPullNumber_ = function(number) {
    if (number && number[0] !== undefined) {
        return config.pull_branch_name_prefix + number
    }
}

PullRequest.prototype.getPullRequestNumberFromBranch_ = function(currentBranch, prefix) {
    if (currentBranch && startsWith(currentBranch, prefix)) {
        return currentBranch.replace(prefix, '')
    }
}

PullRequest.prototype.getPullsTemplateJson_ = function(pulls) {
    const instance = this
    const options = instance.options
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

PullRequest.prototype.printPullsInfoTable_ = function(pulls) {
    const options = this.options
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

PullRequest.prototype.printPullInfo_ = function(pull) {
    const options = this.options

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

PullRequest.prototype.get = async function(user, repo, number) {
    const instance = this
    const pr = this

    const payload = {
        repo,
        pull_number: number,
        owner: user,
    }

    try {
        var { data: pull } = await instance.GitHub.pulls.get(payload)
    } catch (err) {
        logger.warn(`Can't get pull request ${user}/${repo}/${number}`)
    }

    pr.printPullInfo_(pull)
}

PullRequest.prototype.list = async function(user, repo) {
    const instance = this
    let options = instance.options
    let json

    let sort = options.sort

    if (options.sort === PullRequest.SORT_COMPLEXITY) {
        sort = PullRequest.SORT_CREATED
    }

    const payload = {
        repo,
        sort,
        owner: user,
        direction: options.direction,
        state: options.state,
    }

    try {
        var { data } = await instance.GitHub.pulls.list(payload)
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
        pulls = instance.filterPullsSentByMe_(data)
    } else {
        pulls = data
    }

    if (options.sort && options.sort === PullRequest.SORT_COMPLEXITY) {
        try {
            pulls = await instance.addComplexityParamToPulls_(pulls)
        } catch (err) {
            throw new Error(`Error sorting by complexity\n${err}`)
        }

        pulls = instance.sortPullsByComplexity_(pulls)
    }

    pulls = await Promise.all(
        pulls.map(async pull => {
            const statusPayload = {
                repo,
                owner: user,
                ref: pull.head.sha,
            }

            try {
                var { data } = await instance.GitHub.repos.getCombinedStatusForRef(statusPayload)
            } catch (err) {
                throw new Error(`Error getting combined status for ref\n${err}`)
            }

            return { ...pull, combinedStatus: data.state }
        })
    )

    json = instance.getPullsTemplateJson_(pulls)

    if (pulls.length) {
        logger.log(logger.colors.yellow(`${user}/${repo}`))

        json.branches.forEach((branch, index, arr) => {
            logger.log(`${logger.colors.blue('Branch:')} ${branch.name} (${branch.total})`)

            if (config.pretty_print) {
                instance.printPullsInfoTable_(branch.pulls)
            } else {
                branch.pulls.forEach(instance.printPullInfo_, instance)
            }

            if (index !== arr.length - 1) {
                logger.log('')
            }
        })

        if (options.all) {
            logger.log('')
        }
    }
}

PullRequest.prototype.listFromAllRepositories = async function() {
    const instance = this
    const options = instance.options
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
        var { data: repositories } = await instance.GitHub.repos[apiMethod](payload)
    } catch (err) {
        throw new Error(`Error listing repos`)
    }

    return Promise.all(
        repositories.map(repository => {
            instance.list(repository.owner.login, repository.name)
        })
    )
}

PullRequest.prototype.open = async function() {
    var instance = this

    const { data: pull } = await instance.getPullRequest_()

    return instance.updatePullRequest_(pull.title, pull.body, PullRequest.STATE_OPEN)
}

PullRequest.prototype.setMergeCommentRequiredOptions_ = function() {
    const options = this.options
    const lastCommitSHA = git.getLastCommitSHA()
    const changes = git.countUserAdjacentCommits()

    options.currentSHA = lastCommitSHA

    if (changes > 0) {
        options.changes = changes
    }

    options.pullHeadSHA = `${lastCommitSHA}~${changes}`
}

PullRequest.prototype.sortPullsByComplexity_ = data => {
    const instance = this
    const options = instance.options

    data.sort((a, b) => {
        if (a.complexity > b.complexity) {
            return -1
        }

        if (a.complexity < b.complexity) {
            return +1
        }

        return 0
    })

    if (options.direction === PullRequest.DIRECTION_ASC) {
        data.reverse()
    }

    return data
}

PullRequest.prototype.submit = async function(user) {
    const instance = this
    const options = instance.options

    let pullBranch = options.pullBranch || options.currentBranch

    if (testing) {
        pullBranch = 'test'
    }

    git.push(config.default_remote, pullBranch)

    if (!options.title) {
        options.title = git.getLastCommitMessage(pullBranch)
    }

    var payload: any = {
        owner: user,
        base: options.branch,
        head: `${options.user}:${pullBranch}`,
        repo: options.repo,
    }

    try {
        if (options.issue) {
            payload.issue = options.issue
            var { data } = await instance.GitHub.pulls.createFromIssue(payload)
        } else {
            payload.body = options.description
            payload.title = options.title

            var { data } = await instance.GitHub.pulls.create(payload)
        }
    } catch (err) {
        var { originalError, pull } = await instance.checkPullRequestIntegrity_(err, user)

        if (originalError) {
            throw new Error(`Error submitting PR\n${err}`)
        }
    }

    return data || pull
}

PullRequest.prototype.updatePullRequest_ = function(title, opt_body, state) {
    const instance = this
    const options = instance.options

    if (opt_body) {
        opt_body = logger.applyReplacements(opt_body, config.replace)
    }

    const payload = {
        state,
        title,
        body: opt_body,
        pull_number: options.number,
        repo: options.repo,
        owner: options.user,
    }

    return instance.GitHub.pulls.update(payload)
}

PullRequest.prototype._fetchHandler = async function() {
    const instance = this
    const options = this.options

    let fetchType = PullRequest.FETCH_TYPE_CHECKOUT

    if (options.merge) {
        fetchType = PullRequest.FETCH_TYPE_MERGE
    } else if (options.rebase) {
        fetchType = PullRequest.FETCH_TYPE_REBASE
    }

    beforeHooks('pull-request.fetch', instance)

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
        await instance.fetch(fetchType)
    } catch (err) {
        throw new Error(`Can't fetch pull request ${options.number}.\n${err}`)
    }

    afterHooks('pull-request.fetch', instance)
}

PullRequest.prototype._fwdHandler = async function() {
    const instance = this
    const options = this.options

    beforeHooks('pull-request.fwd', instance)

    logger.log(
        `Forwarding pull request ${logger.colors.green(
            `#${options.number}`
        )} to ${logger.colors.magenta(`@${options.fwd}`)}`
    )

    try {
        // data from submitting pr
        var { data: pull } = await instance.forward()
    } catch (err) {
        throw new Error(`Can't forward pull request ${options.number} to ${options.fwd}.\n${err}`)
    }

    if (pull) {
        options.submittedPullNumber = pull.number
        options.forwardedPull = pull.number
    }

    logger.log(pull.html_url)

    instance.setMergeCommentRequiredOptions_()

    afterHooks('pull-request.fwd', instance)
}

PullRequest.prototype._closeHandler = async function() {
    const instance = this
    const options = this.options

    beforeHooks('pull-request.close', instance)

    logger.log(`Closing pull request ${logger.colors.green(`#${options.number}`)}`)

    try {
        var { data } = await instance.close()
    } catch (err) {
        throw new Error(`Can't close pull request ${options.number}.\n${err}`)
    }

    logger.log(data.html_url)

    instance.setMergeCommentRequiredOptions_()

    afterHooks('pull-request.close', instance)
}

PullRequest.prototype._commentHandler = async function() {
    const instance = this
    const options = instance.options

    logger.log(`Adding comment on pull request ${logger.colors.green(`#${options.number}`)}`)

    try {
        var { data } = await instance.comment()
    } catch (err) {
        throw new Error(`Can't comment on pull request ${options.number}.`)
    }

    logger.log(data.html_url)
}

PullRequest.prototype._infoHandler = async function() {
    const instance = this
    const options = this.options

    try {
        await instance.get(options.user, options.repo, options.number)
    } catch (err) {
        throw new Error(`Can't get pull requests.\n${err}`)
    }
}

PullRequest.prototype._listHandler = async function() {
    const instance = this
    const options = this.options
    let who

    options.sort = options.sort || PullRequest.SORT_CREATED
    options.direction = options.direction || PullRequest.DIRECTION_DESC

    if (options.all) {
        who = options.user

        if (options.org) {
            who = options.org
        }

        logger.log(`Listing all ${options.state} pull requests for ${logger.colors.green(who)}`)

        try {
            await instance.listFromAllRepositories()
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
            await instance.list(options.user, options.repo)
        } catch (err) {
            throw new Error(`Can't list pull requests.\n${err}`)
        }
    }
}

PullRequest.prototype._openHandler = async function() {
    const instance = this
    const options = this.options

    beforeHooks('pull-request.open', instance)

    logger.log(`Opening pull request ${logger.colors.green(`#${options.number}`)}`)

    try {
        var { data } = await instance.open()
    } catch (err) {
        logger.error(`Can't open pull request ${options.number}.`)
    }

    logger.log(data.html_url)

    afterHooks('pull-request.open', instance)
}

PullRequest.prototype._submitHandler = async function() {
    const instance = this
    const options = this.options

    beforeHooks('pull-request.submit', instance)

    logger.log(`Submitting pull request to ${logger.colors.magenta(`@${options.submit}`)}`)

    try {
        var pull = await instance.submit(options.submit)
    } catch (err) {
        throw new Error(`Can't submit pull request\n${err}`)
    }

    if (pull) {
        options.submittedPull = pull.number
    }

    logger.log(pull.html_url)

    instance.setMergeCommentRequiredOptions_()

    afterHooks('pull-request.submit', instance)
}
