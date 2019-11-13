/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { getIssue } from '.'
import * as logger from '../../logger'

export async function lockHandler(options) {
    const {
        data: { locked },
    } = await getIssue(options)

    if (!locked) {
        var { status } = await lock(options)

        logger.log(
            status === 204
                ? logger.colors.green('Success locking issue.')
                : logger.colors.green('Failed to lock issue.')
        )
    } else {
        logger.log('Issue is already locked.')
    }
}

function lock(options) {
    const { number, user, repo, 'lock-reason': lockReason, GitHub } = options

    const payload = {
        repo,
        owner: user,
        issue_number: number,
        ...(lockReason ? { lock_reason: lockReason } : {}),
        mediaType: {
            previews: ['sailor-v-preview'],
        },
    }

    return GitHub.issues.lock(payload)
}
