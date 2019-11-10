/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as logger from '../../logger'
import { formatIssues, testing } from './index'
import { handlePagination, askUserToPaginate } from '../../utils'
import * as ora from 'ora'

const spinner = ora({ text: 'Fetching Issues', discardStdin: false })

export async function list(options) {
    const { user, repo, page = 1, pageSize } = options

    spinner.start()

    let payload

    payload = {
        repo,
        owner: user,
        state: options.state,
        page,
        per_page: pageSize,
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

        if (!milestoneNumber) {
            logger.log(
                `No issues found with milestone title: ${logger.colors.red(options.milestone)}`
            )
            return
        }

        payload.milestone = `${milestoneNumber}`
    }

    if (options.assignee) {
        payload.assignee = options.assignee
    }

    const { data, hasNextPage } = await handlePagination({
        options,
        listEndpoint: options.GitHub.issues.listForRepo,
        payload,
    })

    const issues = data.filter(result => Boolean(result))

    spinner.stop()

    if (issues && issues.length > 0) {
        const formattedIssues = formatIssues(issues, options.detailed)

        options.all
            ? logger.log(`\n${options.user}/${options.repo}:\n${formattedIssues}`)
            : logger.log(formattedIssues)
    } else {
        logger.log(`\nNo issues on ${options.user}/${options.repo}`)
    }

    if (hasNextPage && !testing) {
        const continuePaginating = await askUserToPaginate(
            `Issues for ${options.user}/${options.repo}`
        )

        continuePaginating && (await list({ ...options, page: page + 1 }))
    }
}

export async function listFromAllRepositories(options) {
    const payload = {
        type: 'all',
        username: options.user,
    }

    const repositories: any = await options.GitHub.paginate(
        options.GitHub.repos.listForUser.endpoint(payload)
    )

    for (const repo of repositories) {
        await list({ ...options, user: repo.owner.login, repo: repo.name })
    }
}
