/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { openUrl } from '../../utils'

export function browser(user, repo, number, githubHost) {
    if (number) {
        openUrl(`${githubHost}/${user}/${repo}/pull/${number}`)
    } else {
        openUrl(`${githubHost}/${user}/${repo}/pulls`)
    }
}
