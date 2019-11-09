/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as logger from '../../logger'
import { afterHooks, beforeHooks } from '../../hooks'
import { getIssue, editIssue, STATE_OPEN } from './index'

export async function openHandler(options) {
    await beforeHooks('issue.open', { options })

    for (const number of options.number) {
        logger.log(`Opening issue ${number} on ${options.userRepo}`)

        try {
            var { data } = await open(options, number)
        } catch (err) {
            throw new Error(`Can't close issue.\n${err}`)
        }

        logger.log(logger.colors.cyan(data.html_url))
    }

    await afterHooks('issue.open', { options })
}

async function open(options, number) {
    const issue = await getIssue(options, number)

    return editIssue(options, issue.title, STATE_OPEN, number)
}
