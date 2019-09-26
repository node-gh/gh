/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import { isArray } from 'lodash'
import { produce } from 'immer'
import { openUrl, userRanValidFlags } from '../utils'
import * as base from '../base'
import { afterHooks, beforeHooks } from '../hooks'
import * as logger from '../logger'

const config = base.getConfig()

// -- Constants ------------------------------------------------------------------------------------

export const DETAILS = {
    alias: 'is',
    description: 'Provides a set of util commands to work with Issues.',
    iterative: 'number',
    commands: ['assign', 'browser', 'close', 'comment', 'list', 'new', 'open', 'search'],
    options: {
        all: Boolean,
        assign: Boolean,
        assignee: String,
        browser: Boolean,
        close: Boolean,
        comment: String,
        date: String,
        detailed: Boolean,
        labels: [String],
        list: Boolean,
        link: Boolean,
        message: String,
        milestone: [Number, String],
        'no-milestone': Boolean,
        new: Boolean,
        number: [String, Array],
        open: Boolean,
        remote: String,
        repo: String,
        search: String,
        state: ['open', 'closed'],
        title: String,
        user: String,
    },
    shorthands: {
        a: ['--all'],
        A: ['--assignee'],
        B: ['--browser'],
        C: ['--close'],
        c: ['--comment'],
        d: ['--detailed'],
        L: ['--labels'],
        k: ['--link'],
        l: ['--list'],
        m: ['--message'],
        M: ['--milestone'],
        N: ['--new'],
        n: ['--number'],
        o: ['--open'],
        r: ['--repo'],
        s: ['--search'],
        S: ['--state'],
        t: ['--title'],
        u: ['--user'],
    },
}

const STATE_CLOSED = 'closed'
const STATE_OPEN = 'open'

// -- Commands -------------------------------------------------------------------------------------

export const name = 'Issue'

export async function run(options, done) {
    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command')
    }

    const number = logger.colors.green(`#${options.number}`)

    options = produce(options, draft => {
        draft.state = draft.state || STATE_OPEN

        if (!userRanValidFlags(DETAILS.commands, draft)) {
            const payload = draft.argv.remain && draft.argv.remain.slice(1)

            if (payload && payload[0]) {
                if (/^\d+$/.test(payload[0])) {
                    draft.browser = true
                    draft.number = payload[0]
                } else {
                    draft.new = true
                    draft.title = draft.title || payload[0]
                    draft.message = draft.message || payload[1]
                }
            } else {
                draft.list = true
            }
        }
    })

    if (options.assign) {
        await beforeHooks('issue.assign', { options })

        logger.log(
            `Assigning issue ${number} on ${getUserRepo(options)} to ${logger.colors.magenta(
                options.assignee
            )}`
        )

        try {
            var { data } = await assign(options)
        } catch (err) {
            throw new Error(`Can't assign issue.\n${err}`)
        }

        logger.log(logger.colors.cyan(data.html_url))

        await afterHooks('issue.assign', { options })
    } else if (options.browser) {
        browser(options.user, options.repo, options.number)
    } else if (options.comment) {
        logger.log(`Adding comment on issue ${number} on ${getUserRepo(options)}`)

        try {
            var { data } = await comment(options)
        } catch (err) {
            throw new Error(`Can't add comment.\n${err}`)
        }

        logger.log(logger.colors.cyan(data.html_url))
    } else if (options.list) {
        try {
            if (options.all) {
                logger.log(
                    `Listing ${logger.colors.green(options.state)} issues for ${logger.colors.green(
                        options.user
                    )}`
                )

                await listFromAllRepositories(options)
            } else {
                logger.log(
                    `Listing ${logger.colors.green(options.state)} issues on ${getUserRepo(
                        options
                    )}`
                )

                await list(options, options.user, options.repo)
            }
        } catch (err) {
            throw new Error(`Error listing issues\n${err}`)
        }
    } else if (options.new) {
        await beforeHooks('issue.new', { options })

        logger.log(`Creating a new issue on ${getUserRepo(options)}`)

        try {
            var { data } = await newIssue(options)
        } catch (err) {
            throw new Error(`Can't create issue.\n${err}`)
        }

        if (data) {
            options = produce(options, draft => {
                draft.number = data.number
            })

            logger.log(data.html_url)
        }

        await afterHooks('issue.new', { options })
    } else if (options.open) {
        await beforeHooks('issue.open', { options })

        await openHandler(options)

        await afterHooks('issue.open', { options })
    } else if (options.close) {
        await beforeHooks('issue.close', { options })

        await closeHandler(options)

        await afterHooks('issue.close', { options })
    } else if (options.search) {
        let { repo, user } = options
        const query = logger.colors.green(options.search)

        if (options.all) {
            repo = undefined

            logger.log(`Searching for ${query} in issues for ${logger.colors.green(user)}\n`)
        } else {
            logger.log(`Searching for ${query} in issues for ${getUserRepo(options)}\n`)
        }

        try {
            await search(options, user, repo)
        } catch (err) {
            throw new Error(`Can't search issues for ${getUserRepo(options)}: \n${err}`)
        }
    }

    done && done()
}

async function assign(options) {
    const issue = await getIssue_(options)

    return editIssue_(options, issue.title, STATE_OPEN)
}

function browser(user, repo, number) {
    if (!number) {
        number = ''
    }

    openUrl(`${config.github_host}/${user}/${repo}/issues/${number}`)
}

function comment(options) {
    const body = logger.applyReplacements(options.comment, config.replace) + config.signature

    const payload = {
        body,
        issue_number: options.number,
        repo: options.repo,
        owner: options.user,
    }

    return options.GitHub.issues.createComment(payload)
}

function editIssue_(options, title, state, number?: number) {
    let payload

    payload = {
        state,
        title,
        assignee: options.assignee,
        labels: options.labels || [],
        milestone: options.milestone,
        issue_number: number || options.number,
        owner: options.user,
        repo: options.repo,
    }

    return options.GitHub.issues.update(payload)
}

function getIssue_(options, number?: number) {
    const payload = {
        issue_number: number || options.number,
        repo: options.repo,
        owner: options.user,
    }

    return options.GitHub.issues.get(payload)
}

async function list(options, user, repo) {
    let payload

    payload = {
        repo,
        owner: user,
        state: options.state,
    }

    if (options.labels) {
        payload.labels = options.labels
    }

    if (options['no-milestone']) {
        payload.milestone = 'none'
    }

    if (options.milestone) {
        const data = await options.GitHub.paginate(
            options.GitHub.issues.listMilestonesForRepo.endpoint({
                repo,
                owner: user,
            })
        )

        const milestoneNumber = data
            .filter(milestone => options.milestone === milestone.title)
            .map(milestone => milestone.number)[0]

        payload.milestone = `${milestoneNumber}`
    }

    if (options.assignee) {
        payload.assignee = options.assignee
    }

    const data = await options.GitHub.paginate(options.GitHub.issues.listForRepo.endpoint(payload))

    const issues = data.filter(result => Boolean(result))

    if (issues && issues.length > 0) {
        const formattedIssues = formatIssues(issues, options.detailed)
        options.all
            ? logger.log(`\n${getUserRepo(options)}:\n${formattedIssues}`)
            : logger.log(formattedIssues)
    } else {
        logger.log(`\nNo issues on ${getUserRepo(options)}`)
    }
}

async function listFromAllRepositories(options) {
    const payload = {
        type: 'all',
        username: options.user,
    }

    const repositories: any = await options.GitHub.paginate(
        options.GitHub.repos.listForUser.endpoint(payload)
    )

    for (const repo of repositories) {
        await list(options, repo.owner.login, repo.name)
    }
}

function newIssue(options) {
    let body

    if (options.message) {
        body = logger.applyReplacements(options.message, config.replace)
    }

    options = produce(options, draft => {
        if (draft.labels) {
            draft.labels = draft.labels.split(',')
        } else {
            draft.labels = []
        }
    })

    const payload = {
        body,
        assignee: options.assignee,
        repo: options.repo,
        title: options.title,
        owner: options.user,
        labels: options.labels,
    }

    return options.GitHub.issues.create(payload)
}

async function close(options, number) {
    const issue = await getIssue_(options, number)

    return editIssue_(options, issue.title, STATE_CLOSED, number)
}

async function open(options, number) {
    const issue = await getIssue_(options, number)

    return editIssue_(options, issue.title, STATE_OPEN, number)
}

async function search(options, user, repo) {
    let query = ['type:issue']
    let payload

    if (!options.all && repo) {
        query.push(`repo:${repo}`)
    }

    if (user) {
        query.push(`user:${user}`)
    }

    query.push(options.search)

    payload = {
        q: query.join(' '),
    }

    const { data } = await options.GitHub.search.issuesAndPullRequests(payload)

    if (data.items && data.items.length > 0) {
        const formattedIssues = formatIssues(data.items, options.detailed)

        logger.log(formattedIssues)
    } else {
        logger.log('Could not find any issues matching your query.')
    }
}

async function closeHandler(options) {
    for (const number of options.number) {
        logger.log(`Closing issue ${number} on ${getUserRepo(options)}`)

        try {
            var { data } = await close(options, number)
        } catch (err) {
            throw new Error(`Can't close issue.\n${err}`)
        }

        logger.log(logger.colors.cyan(data.html_url))
    }
}

async function openHandler(options) {
    for (const number of options.number) {
        logger.log(`Opening issue ${number} on ${getUserRepo(options)}`)

        try {
            var { data } = await open(options, number)
        } catch (err) {
            throw new Error(`Can't close issue.\n${err}`)
        }

        logger.log(logger.colors.cyan(data.html_url))
    }
}

function formatIssues(issues, showDetailed, dateFormatter?: string) {
    issues.sort((a, b) => {
        return a.number > b.number ? -1 : 1
    })

    if (issues && issues.length > 0) {
        const formattedIssuesArr = issues.map(issue => {
            const issueNumber = logger.colors.green(`#${issue.number}`)
            const issueUser = logger.colors.magenta(`@${issue.user.login}`)
            const issueDate = `(${logger.getDuration(issue.created_at, dateFormatter)})`

            let formattedIssue = `${issueNumber} ${issue.title} ${issueUser} ${issueDate}`

            if (showDetailed) {
                if (issue.body) {
                    formattedIssue = `
                        ${formattedIssue}
                        ${issue.body}
                    `
                }

                if (isArray(issue.labels) && issue.labels.length > 0) {
                    const labels = issue.labels.map(label => label.name)
                    const labelHeading = labels.length > 1 ? 'labels: ' : 'label: '

                    formattedIssue = `
                        ${formattedIssue}
                        ${logger.colors.yellow(labelHeading) + labels.join(', ')}
                    `
                }

                if (issue.milestone) {
                    const { number, title } = issue.milestone

                    formattedIssue = `
                        ${formattedIssue}
                        ${`${logger.colors.green('milestone: ')} ${title} - ${number}`}
                    `
                }

                formattedIssue = `
                    ${formattedIssue}
                    ${logger.colors.blue(issue.html_url)}
                `
            }

            return trim(formattedIssue)
        })

        return formattedIssuesArr.join('\n\n')
    }

    return null
}

function trim(str) {
    return str
        .replace(/^[ ]+/gm, '')
        .replace(/[\r\n]+/g, '\n')
        .trim()
}

function getUserRepo(options) {
    return logger.colors.green(`${options.user}/${options.repo}`)
}
