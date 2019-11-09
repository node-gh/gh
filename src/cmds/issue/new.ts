/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { openFileInEditor, userLeftMsgEmpty } from '../../utils'
import { produce } from 'immer'
import * as logger from '../../logger'

export function newIssue(options) {
    options = produce(options, draft => {
        if (draft.labels) {
            draft.labels = draft.labels.split(',')
        } else {
            draft.labels = []
        }

        if (draft.message) {
            draft.message = logger.applyReplacements(draft.message, draft.config.replace)
        }

        if (userLeftMsgEmpty(draft.title)) {
            draft.title = openFileInEditor(
                'temp-gh-issue-title.txt',
                '# Add a issue title message on the next line'
            )
        }

        // If user passes an empty title and message, --message will get merged into options.title
        // Need to reference the original title not the potentially modified one
        if (userLeftMsgEmpty(options.title) || userLeftMsgEmpty(draft.message)) {
            draft.message = openFileInEditor(
                'temp-gh-issue-body.md',
                '<!-- Add an issue body message in markdown format below -->'
            )
        }
    })

    const payload = {
        body: options.message,
        assignee: options.assignee,
        repo: options.repo,
        title: options.title,
        owner: options.user,
        labels: options.labels,
    }

    return options.GitHub.issues.create(payload)
}
