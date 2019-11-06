/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as git from '../../git'
import { getPullRequest, updatePullRequest } from './index'

const STATE_CLOSED = 'closed'

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
