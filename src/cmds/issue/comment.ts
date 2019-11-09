/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { openFileInEditor, userLeftMsgEmpty } from '../../utils'
import * as logger from '../../logger'

export function comment(options) {
    const useEditor = options.config.use_editor !== false

    let body =
        logger.applyReplacements(options.comment, options.config.replace) + options.config.signature

    if (useEditor && userLeftMsgEmpty(options.comment)) {
        body = openFileInEditor(
            'temp-gh-issue-comment.md',
            '<!-- Add an issue comment message in markdown format below -->'
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
