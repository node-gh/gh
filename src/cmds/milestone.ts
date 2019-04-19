/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import { getGitHubInstance } from '../github'
import * as logger from '../logger'

// -- Constructor ----------------------------------------------------------------------------------

export default function Milestone(options) {
    this.options = options

    if (options.organization) {
        options.all = true
    }

    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command')
    }
}

// -- Constants ------------------------------------------------------------------------------------

Milestone.DETAILS = {
    alias: 'ms',
    description: 'Provides a set of util commands to work with Milestones.',
    commands: ['list'],
    options: {
        all: Boolean,
        date: String,
        organization: String,
        list: Boolean,
    },
    shorthands: {
        a: ['--all'],
        o: ['--organization'],
        l: ['--list'],
    },
}

// -- Commands -------------------------------------------------------------------------------------

Milestone.prototype.run = async function(done) {
    const instance = this
    const options = instance.options

    instance.GitHub = await getGitHubInstance()

    if (options.all) {
        logger.log(
            `Listing milestones for ${logger.colors.green(options.organization || options.user)}`
        )

        try {
            await instance.listFromAllRepositories()
        } catch (err) {
            throw new Error(`Can't list milestones for ${options.user}.\n${err}`)
        }
    } else {
        const userRepo = `${options.user}/${options.repo}`

        logger.log(`Listing milestones on ${logger.colors.green(userRepo)}`)

        try {
            await instance.list(options.user, options.repo)
        } catch (err) {
            throw new Error(`Can't list milestones on ${userRepo}\n${err}`)
        }

        done && done()
    }
}

Milestone.prototype.list = async function(user, repo) {
    const instance = this
    const options = instance.options
    let payload

    payload = {
        repo,
        owner: user,
        sort: 'due_on',
    }

    try {
        var { data } = await instance.GitHub.issues.listMilestonesForRepo(payload)
    } catch (err) {
        throw new Error(logger.getErrorMessage(err))
    }

    if (data && data.length > 0) {
        data.forEach(milestone => {
            const due = milestone.due_on ? logger.getDuration(milestone.due_on) : 'n/a'
            const description = milestone.description || ''
            const title = logger.colors.green(milestone.title)
            const state = logger.colors.magenta(`@${milestone.state} (due ${due})`)
            const prefix = options.all ? logger.colors.blue(`${user}/${repo} `) : ''

            logger.log(`${prefix} ${title} ${description} ${state}`)
        })
    }
}

Milestone.prototype.listFromAllRepositories = async function() {
    const instance = this
    const options = instance.options

    let operation = 'list'
    let payload

    payload = {
        type: 'all',
        owner: options.user,
    }

    if (options.organization) {
        operation = 'listForOrg'
        payload.org = options.organization
    }

    const { data } = await instance.GitHub.repos[operation](payload)

    for (const repo of data) {
        await instance.list(repo.owner.login, repo.name)
    }
}
