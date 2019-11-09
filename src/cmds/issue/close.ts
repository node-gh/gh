/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as logger from '../../logger'
import { afterHooks, beforeHooks } from '../../hooks'
import { getIssue, editIssue, STATE_CLOSED } from './index'

export async function closeHandler(options) {
    await beforeHooks('issue.close', { options })

    for (const number of options.number) {
        logger.log(`Closing issue ${number} on ${options.userRepo}`)

        try {
            var { data } = await close(options, number)
        } catch (err) {
            throw new Error(`Can't close issue.\n${err}`)
        }

        logger.log(logger.colors.cyan(data.html_url))
    }

    await afterHooks('issue.close', { options })
}

async function close(options, number) {
    const issue = await getIssue(options, number)

    return editIssue(options, issue.title, STATE_CLOSED, number)
}
