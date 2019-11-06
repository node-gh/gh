/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { getPullRequest, updatePullRequest, STATE_OPEN } from './index'

export async function open(options) {
    const { data: pull } = await getPullRequest(options)

    return updatePullRequest(options, pull.title, pull.body, STATE_OPEN)
}
