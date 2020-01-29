/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { produce } from 'immer'
import * as git from '../../git'
import { userLeftMsgEmpty, openFileInEditor } from '../../utils'
import { testing, STATE_OPEN, setMergeCommentRequiredOptions } from './index'
import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'

export async function submit(options, user) {
    const useEditor = options.config.use_editor !== false

    let description = options.description
    let title = options.title
    let pullBranch = options.pullBranch || options.currentBranch

    if (testing) {
        pullBranch = 'test'
    }

    if (userLeftMsgEmpty(title)) {
        title = useEditor
            ? openFileInEditor(
                  'temp-gh-pr-title.txt',
                  `# Add a pr title message on the next line\n`
              )
            : git.getLastCommitMessage(pullBranch)
    }

    /*
     * If user passes an empty title and description, --description will get merged into options.title
     * Need to reference the original title not the potentially modified one
     * Also check if user wants to user their editor to add a description
     */
    if (useEditor && (userLeftMsgEmpty(options.title) || userLeftMsgEmpty(description))) {
        description = openFileInEditor(
            'temp-gh-pr-body.md',
            '<!-- Add an pr body message in markdown format below -->'
        )
    }

    const payload: any = {
        mediaType: {
            previews: ['shadow-cat'],
        },
        owner: user,
        base: options.branch,
        head: `${options.user}:${pullBranch}`,
        repo: options.repo,
        title: title,
        ...(options.issue ? { issue: options.issue } : {}),
        ...(options.draft ? { draft: options.draft } : {}),
        ...(description ? { body: description } : {}),
    }

    try {
        git.push(options.config.default_remote, pullBranch)

        const method = payload.issue ? 'createFromIssue' : 'create'

        var { data } = await options.GitHub.pulls[method](payload)
    } catch (err) {
        var { originalError, pull } = await checkPullRequestIntegrity_(options, err)

        if (originalError) {
            throw new Error(`Error submitting PR\n${err}`)
        }
    }

    return data || pull
}

export async function submitHandler(options) {
    await beforeHooks('pull-request.submit', { options })

    logger.log(`Submitting pull request to ${logger.colors.magenta(`@${options.submit}`)}`)

    try {
        var pull = await submit(options, options.submit)
    } catch (err) {
        throw new Error(`Can't submit pull request\n${err}`)
    }

    if (pull.draft) {
        logger.log('Opened in draft state.')
    }

    if (pull) {
        options = produce(options, draft => {
            draft.submittedPull = pull.number
        })
    }

    logger.log(pull.html_url)

    options = setMergeCommentRequiredOptions(options)

    await afterHooks('pull-request.submit', { options })
}

async function checkPullRequestIntegrity_(options, originalError) {
    let pull

    const payload = {
        owner: options.user,
        repo: options.repo,
        state: STATE_OPEN,
    }

    try {
        var pulls = await options.GitHub.paginate(options.GitHub.pulls.list.endpoint(payload))
    } catch (err) {
        throw new Error(`Error listings PRs\n${err}`)
    }

    pulls.forEach(data => {
        if (
            data.base.ref === options.branch &&
            data.head.ref === options.currentBranch &&
            data.base.sha === data.head.sha &&
            data.base.user.login === options.user &&
            data.head.user.login === options.user
        ) {
            pull = data
            originalError = null
            return
        }
    })

    return {
        originalError,
        pull,
    }
}
