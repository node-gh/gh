/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as logger from '../logger'
import { produce } from 'immer'
// -- Constants ------------------------------------------------------------------------------------

export const name = 'Milestone'
export const DETAILS = {
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

export async function run(options, done) {
    if (options.organization) {
        options = produce(options, draft => {
            draft.all = true
        })
    }

    if (!options.repo && !options.all) {
        logger.error('You must specify a Git repository with a GitHub remote to run this command')
    }

    if (options.all) {
        logger.log(
            `Listing milestones for ${logger.colors.green(options.organization || options.user)}`
        )

        try {
            await listFromAllRepositories(options)
        } catch (err) {
            throw new Error(`Can't list milestones for ${options.user}.\n${err}`)
        }
    } else {
        const userRepo = `${options.user}/${options.repo}`

        logger.log(`Listing milestones on ${logger.colors.green(userRepo)}`)

        try {
            await list(options, options.user, options.repo)
        } catch (err) {
            throw new Error(`Can't list milestones on ${userRepo}\n${err}`)
        }

        done && done()
    }
}

async function list(options, user, repo) {
    let payload

    payload = {
        repo,
        owner: user,
        sort: 'due_on',
    }

    try {
        var data = await options.GitHub.paginate(
            options.GitHub.issues.listMilestonesForRepo.endpoint(payload)
        )
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

async function listFromAllRepositories(options) {
    let operation = 'listForUser'
    let payload

    payload = {
        type: 'all',
        username: options.user,
    }

    if (options.organization) {
        operation = 'listForOrg'
        payload.org = options.organization
    }

    const data = await options.GitHub.paginate(options.GitHub.repos[operation].endpoint(payload))

    for (const repo of data) {
        await list(options, repo.owner.login, repo.name)
    }
}
