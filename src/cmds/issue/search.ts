/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { formatIssues } from './index'
import * as logger from '../../logger'

export async function search(options, user, repo) {
    const query = ['type:issue']

    if (!options.all && repo) {
        query.push(`repo:${repo}`)
    }

    if (user) {
        query.push(`user:${user}`)
    }

    query.push(options.search)

    const payload = {
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
