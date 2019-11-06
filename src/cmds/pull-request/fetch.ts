/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as git from '../../git'
import { getPullRequest, FETCH_TYPE_SILENT } from './index'

export async function fetch(options, optType) {
    try {
        var { data: pull } = await getPullRequest(options)
    } catch (err) {
        throw new Error(`Error getting PR\n${err}`)
    }

    const headBranch = pull.head.ref
    const repoUrl = options.config.ssh === false ? pull.head.repo.clone_url : pull.head.repo.ssh_url

    git.fetch(repoUrl, headBranch, options.pullBranch)

    if (optType !== FETCH_TYPE_SILENT) {
        git[optType](options.pullBranch)
    }

    return pull
}
