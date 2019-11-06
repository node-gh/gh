/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { userLeftMsgEmpty, openFileInEditor } from '../../utils'
import * as logger from '../../logger'

export async function commentHandler(options) {
    logger.log(`Adding comment on pull request ${logger.colors.green(`#${options.number}`)}`)

    try {
        var { data } = await comment(options)
    } catch (err) {
        throw new Error(`Can't comment on pull request ${options.number}.\n${err}`)
    }

    logger.log(data.html_url)
}

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
