/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as git from '../../git'
import { getPullRequest, updatePullRequest, setMergeCommentRequiredOptions } from './index'
import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'

const STATE_CLOSED = 'closed'

export async function closeHandler(options) {
    await beforeHooks('pull-request.close', { options })

    logger.log(`Closing pull request ${logger.colors.green(`#${options.number}`)}`)

    try {
        var { data } = await close(options)
    } catch (err) {
        throw new Error(`Can't close pull request ${options.number}.\n${err}`)
    }

    logger.log(data.html_url)

    options = setMergeCommentRequiredOptions(options)

    await afterHooks('pull-request.close', { options })
}

export async function close(options) {
    const { data: pull } = await getPullRequest(options)

    const data = await updatePullRequest(options, pull.title, pull.body, STATE_CLOSED)

    if (options.pullBranch === options.currentBranch) {
        git.checkout(pull.base.ref)
    }

    if (options.pullBranch) {
        git.deleteBranch(options.pullBranch)
    }

    return data
}
