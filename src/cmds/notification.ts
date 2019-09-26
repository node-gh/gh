/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import { getGitHubInstance } from '../github'
import * as logger from '../logger'
import { userRanValidFlags } from '../utils'

const printed = {}

// -- Constructor ----------------------------------------------------------------------------------

export default function Notifications() {}

// -- Constants ------------------------------------------------------------------------------------

Notifications.DETAILS = {
    alias: 'nt',
    description: 'Provides a set of util commands to work with Notifications.',
    commands: ['latest', 'watch'],
    options: {
        date: String,
        latest: Boolean,
        remote: String,
        repo: String,
        user: String,
        watch: Boolean,
    },
    shorthands: {
        l: ['--latest'],
        r: ['--repo'],
        u: ['--user'],
        w: ['--watch'],
    },
    payload(_, options) {
        options.latest = true
    },
}

// -- Commands -------------------------------------------------------------------------------------

Notifications.prototype.run = async function(options, done) {
    const instance = this

    if (!options.repo) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command')
    }

    instance.GitHub = await getGitHubInstance()

    if (!userRanValidFlags(Notifications.DETAILS.commands, options)) {
        options.latest = true
    }

    if (options.latest) {
        logger.log(
            `Listing activities on ${logger.colors.green(`${options.user}/${options.repo}`)}`
        )

        await instance.latest(false)
    }

    if (options.watch) {
        logger.log(
            `Watching any activity on ${logger.colors.green(`${options.user}/${options.repo}`)}`
        )

        await instance.watch()
    }

    done && done()
}

Notifications.prototype.latest = async function(options, opt_watch) {
    const instance = this

    let payload
    let filteredListEvents = []

    payload = {
        owner: options.user,
        repo: options.repo,
    }

    try {
        var data = await instance.GitHub.paginate(
            instance.GitHub.activity.listRepoEvents.endpoint(payload)
        )
    } catch (err) {
        throw new Error(`Can't get latest notifications.\n${err}`)
    }

    data.forEach(event => {
        event.txt = instance.getMessage_(event)

        if (opt_watch) {
            if (!printed[event.created_at]) {
                filteredListEvents.push(event)
            }
        } else {
            filteredListEvents.push(event)
        }

        printed[event.created_at] = true
    })

    if (filteredListEvents.length) {
        if (!options.watch) {
            logger.log(logger.colors.yellow(`${options.user}/${options.repo}`))
        }

        filteredListEvents.forEach(event => {
            logger.log(
                `${logger.colors.magenta(`@${event.actor.login}`)} ${
                    event.txt
                } ${logger.colors.cyan(options.repo)} ${logger.getDuration(
                    event.created_at,
                    options.date
                )}`
            )
        })
    }
}

Notifications.prototype.watch = async function() {
    const instance = this
    const intervalTime = 3000

    await instance.latest()

    setInterval(async () => {
        await instance.latest(true)
    }, intervalTime)
}

Notifications.prototype.getMessage_ = function(event) {
    let txt = ''
    const type = event.type
    const payload = event.payload

    switch (type) {
        case 'CommitCommentEvent':
            txt = 'commented on a commit at'
            break
        case 'CreateEvent':
            txt = `created ${payload.ref_type} ${logger.colors.green(payload.ref)} at`
            break
        case 'DeleteEvent':
            txt = `removed ${payload.ref_type} ${logger.colors.green(payload.ref)} at`
            break
        case 'ForkEvent':
            txt = 'forked'
            break
        case 'GollumEvent':
            txt = `${payload.pages[0].action} the ${logger.colors.green(
                payload.pages[0].page_name
            )} wiki page at`
            break
        case 'IssueCommentEvent':
            txt = `commented on issue ${logger.colors.green(`#${payload.issue.number}`)} at`
            break
        case 'IssuesEvent':
            txt = `${payload.action} issue ${logger.colors.green(`#${payload.issue.number}`)} at`
            break
        case 'MemberEvent':
            txt = `added ${logger.colors.green(`@${payload.member.login}`)} as a collaborator to`
            break
        case 'PageBuildEvent':
            txt = 'builded a GitHub Page at'
            break
        case 'PublicEvent':
            txt = 'open sourced'
            break
        case 'PullRequestEvent':
            txt = `${payload.action} pull request ${logger.colors.green(`#${payload.number}`)} at`
            break
        case 'PullRequestReviewCommentEvent':
            txt = `commented on pull request ${logger.colors.green(
                `#${payload.pull_request.number}`
            )} at`
            break
        case 'PushEvent':
            txt = `pushed ${logger.colors.green(payload.size)} commit(s) to`
            break
        case 'ReleaseEvent':
            txt = `released ${logger.colors.green(payload.release.tag_name)} at`
            break
        case 'StatusEvent':
            txt = 'changed the status of a commit at'
            break
        case 'WatchEvent':
            txt = 'starred'
            break
        default:
            logger.error(`event type not found: ${logger.colors.red(type)}`)
            break
    }

    return txt
}
