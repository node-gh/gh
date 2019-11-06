/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { produce } from 'immer'
import { submit } from './submit'
import { fetch } from './fetch'
import { FETCH_TYPE_SILENT, setMergeCommentRequiredOptions } from './index'
import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'

export async function fwdHandler(options) {
    await beforeHooks('pull-request.fwd', { options })

    logger.log(
        `Forwarding pull request ${logger.colors.green(
            `#${options.number}`
        )} to ${logger.colors.magenta(`@${options.fwd}`)}`
    )

    try {
        var { options: updatedOptions, data: pull } = await forward(options)
    } catch (err) {
        throw new Error(`Can't forward pull request ${options.number} to ${options.fwd}.\n${err}`)
    }

    if (pull) {
        options = produce(updatedOptions, draft => {
            draft.submittedPullNumber = pull.number
            draft.forwardedPull = pull.number
        })
    }

    logger.log(pull.html_url)

    options = setMergeCommentRequiredOptions(options)

    await afterHooks('pull-request.fwd', { options })
}

export async function forward(options) {
    try {
        var pull = await fetch(options, FETCH_TYPE_SILENT)
    } catch (err) {
        throw new Error(`Error fetching PR\${err}`)
    }

    options = produce(options, draft => {
        draft.title = pull.title
        draft.description = pull.body
        draft.submittedUser = pull.user.login
    })

    const data = await submit(options, options.fwd)

    return { data, options }
}
