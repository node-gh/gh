/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { userLeftMsgEmpty, openFileInEditor } from '../../utils'
import * as logger from '../../logger'

export async function comment(options) {
    let body =
        logger.applyReplacements(options.comment, options.config.replace) + options.config.signature

    if (userLeftMsgEmpty(body)) {
        body = openFileInEditor(
            'temp-gh-pr-comment.md',
            '<!-- Add an pr comment message in markdown format below -->'
        )
    }

    const payload = {
        body,
        issue_number: options.number,
        repo: options.repo,
        owner: options.user,
    }

    return options.GitHub.issues.createComment(payload)
}
