/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { openUrl } from '../../utils'

export function browser({ config, user, repo, number }) {
    if (!number) {
        number = ''
    }

    openUrl(`${config.github_host}/${user}/${repo}/issues/${number}`)
}
