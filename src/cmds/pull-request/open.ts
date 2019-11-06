/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { getPullRequest, updatePullRequest, STATE_OPEN } from './index'
import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'

export async function openHandler(options) {
    await beforeHooks('pull-request.open', { options })

    logger.log(`Opening pull request ${logger.colors.green(`#${options.number}`)}`)

    try {
        var { data } = await open(options)
    } catch (err) {
        logger.error(`Can't open pull request ${options.number}.`)
    }

    logger.log(data.html_url)

    await afterHooks('pull-request.open', { options })
}

export async function open(options) {
    const { data: pull } = await getPullRequest(options)

    return updatePullRequest(options, pull.title, pull.body, STATE_OPEN)
}
