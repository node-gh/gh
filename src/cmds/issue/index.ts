/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import { isArray } from 'lodash'
import { produce } from 'immer'
import { userRanValidFlags } from '../../utils'
import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'
import { browser } from './browser'
import { newIssue } from './new'
import { comment } from './comment'
import { list, listFromAllRepositories } from './list'
import { assign } from './assign'
import { closeHandler } from './close'
import { openHandler } from './open'

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

export const STATE_CLOSED = 'closed'
export const STATE_OPEN = 'open'

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
            `Assigning issue ${number} on ${options.userRepo} to ${logger.colors.magenta(
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
        browser(options)
    } else if (options.comment || options.comment === '') {
        logger.log(`Adding comment on issue ${number} on ${options.userRepo}`)

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
                    `Listing ${logger.colors.green(options.state)} issues on ${options.userRepo}`
                )

                await list(options, options.user, options.repo)
            }
        } catch (err) {
            throw new Error(`Error listing issues\n${err}`)
        }
    } else if (options.new) {
        await beforeHooks('issue.new', { options })

        logger.log(`Creating a new issue on ${options.userRepo}`)

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
        await openHandler(options)
    } else if (options.close) {
        await closeHandler(options)
    } else if (options.search) {
        let { repo, user } = options
        const query = logger.colors.green(options.search)

        if (options.all) {
            repo = undefined

            logger.log(`Searching for ${query} in issues for ${logger.colors.green(user)}\n`)
        } else {
            logger.log(`Searching for ${query} in issues for ${options.userRepo}\n`)
        }

        try {
            await search(options, user, repo)
        } catch (err) {
            throw new Error(`Can't search issues for ${options.userRepo}: \n${err}`)
        }
    }

    done && done()
}

export function editIssue(options, title, state, number?: number) {
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

export function getIssue(options, number?: number) {
    const payload = {
        issue_number: number || options.number,
        repo: options.repo,
        owner: options.user,
    }

    return options.GitHub.issues.get(payload)
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

export function formatIssues(issues, showDetailed, dateFormatter?: string) {
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
