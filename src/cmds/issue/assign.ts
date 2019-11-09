/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { STATE_OPEN, getIssue, editIssue } from './index'

export async function assign(options) {
    const issue = await getIssue(options)

    return editIssue(options, issue.title, STATE_OPEN)
}
