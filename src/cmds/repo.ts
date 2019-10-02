/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as Octokit from '@octokit/rest'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import { openUrl, getCurrentFolderName, userRanValidFlags } from '../utils'
import * as url from 'url'
import * as base from '../base'
import * as git from '../git'
import { produce } from 'immer'

import { afterHooks, beforeHooks } from '../hooks'
import * as logger from '../logger'

const config = base.getConfig()

// -- Constants ------------------------------------------------------------------------------------

export const name = 'Repo'
export const DETAILS = {
    alias: 're',
    description: 'Provides a set of util commands to work with Repositories.',
    commands: ['browser', 'clone', 'delete', 'fork', 'list', 'new', 'update'],
    options: {
        browser: Boolean,
        clone: Boolean,
        color: String,
        date: String,
        delete: String,
        description: String,
        detailed: Boolean,
        gitignore: String,
        fork: String,
        homepage: String,
        init: Boolean,
        label: Boolean,
        list: Boolean,
        new: String,
        organization: String,
        page: String,
        per_page: String,
        private: Boolean,
        protocol: String,
        repo: String,
        type: ['all', 'forks', 'member', 'owner', 'public', 'private', 'source'],
        update: String,
        user: String,
    },
    shorthands: {
        B: ['--browser'],
        c: ['--clone'],
        C: ['--color'],
        D: ['--delete'],
        d: ['--detailed'],
        f: ['--fork'],
        L: ['--label'],
        l: ['--list'],
        N: ['--new'],
        O: ['--organization'],
        p: ['--private'],
        P: ['--protocol'],
        r: ['--repo'],
        t: ['--type'],
        U: ['--update'],
        u: ['--user'],
    },
}

const TYPE_ALL = 'all'
const TYPE_OWNER = 'owner'
const TYPE_PRIVATE = 'private'

// -- Commands -------------------------------------------------------------------------------------

export async function run(options, done) {
    let user = options.loggedUser

    options = produce(options, draft => {
        if (
            !userRanValidFlags(DETAILS.commands, draft) &&
            draft.browser !== false &&
            draft.argv.cooked.length === 1
        ) {
            draft.browser = true
        }
    })

    if (options.browser) {
        browser(options.user, options.repo)
    } else if (options.clone && !options.new) {
        await beforeHooks('repo.get', { options })

        if (options.organization) {
            user = options.organization
        } else if (options.user) {
            user = options.user
        }

        if (fs.existsSync(`${process.cwd()}/${options.repo}`)) {
            logger.error(
                `Can't clone ${logger.colors.green(
                    `${user}/${options.repo}`
                )}. ${logger.colors.green(options.repo)} already exists in this directory.`
            )
            return
        }

        try {
            var { data } = await getRepo(options)
        } catch (err) {
            throw new Error(
                `Can't clone ${logger.colors.green(`${user}/${options.repo}`)}.\n${err}`
            )
        }

        logger.log(data.html_url)

        if (data) {
            clone_(user, options.repo, getCloneUrl(options, config.api.ssh_host))
        }

        await afterHooks('repo.get', { options })
    } else if (options.delete && !options.label) {
        await beforeHooks('repo.delete', { options })

        logger.log(`Deleting repo ${logger.colors.green(`${options.user}/${options.delete}`)}`)

        const answers = await inquirer.prompt([
            {
                type: 'input',
                message: 'Are you sure? This action CANNOT be undone. [y/N]',
                name: 'confirmation',
            },
        ])

        if (answers.confirmation.toLowerCase() === 'y') {
            try {
                const { status } = await deleteRepo(options, options.user, options.delete)

                status === 204 && logger.log('Successfully deleted repo.')
            } catch (err) {
                logger.error(`Can't delete repo.\n${err}`)
            }

            await afterHooks('repo.delete', { options })
        } else {
            logger.log('Not deleted.')
        }
    } else if (options.fork) {
        await beforeHooks('repo.fork', { options })

        if (options.organization) {
            user = options.organization
        }

        options = produce(options, draft => {
            draft.repo = draft.fork
        })

        logger.log(
            `Forking repo ${logger.colors.green(
                `${options.user}/${options.repo}`
            )} into ${logger.colors.green(`${user}/${options.repo}`)}`
        )

        try {
            var { data: forkData } = await fork(options)
        } catch (err) {
            throw new Error(`Can't fork. ${err}`)
        }

        logger.log(`Successfully forked: ${forkData.html_url}`)

        if (forkData && options.clone) {
            clone_(user, options.repo, forkData.ssh_url)
        }

        await afterHooks('repo.fork', { options })
    } else if (options.label) {
        if (options.organization) {
            user = options.organization
        } else if (options.user) {
            user = options.user
        }

        if (options.delete) {
            await beforeHooks('repo.deleteLabel', { options })

            options = produce(options, draft => {
                draft.label = draft.delete
            })

            logger.log(
                `Deleting label ${logger.colors.green(options.label)} on ${logger.colors.green(
                    `${user}/${options.repo}`
                )}`
            )

            try {
                var { status } = await deleteLabel(options, user)
            } catch (err) {
                throw new Error(`Can't delete label.\n${err}`)
            }

            status === 204 && logger.log('Successful.')

            await afterHooks('repo.deleteLabel', { options })
        } else if (options.list) {
            await beforeHooks('repo.listLabels', { options })

            if (options.page) {
                logger.log(
                    `Listing labels from page ${logger.colors.green(
                        options.page
                    )} on ${logger.colors.green(`${user}/${options.repo}`)}`
                )
            } else {
                logger.log(`Listing labels on ${logger.colors.green(`${user}/${options.repo}`)}`)
            }

            try {
                var { data: labelData } = await listLabels(options, user)
            } catch (err) {
                throw new Error(`Can't list labels\n${err}`)
            }

            labelData.forEach(label => logger.log(logger.colors.yellow(label.name)))

            await afterHooks('repo.listLabels', { options })
        } else if (options.new) {
            await beforeHooks('repo.createLabel', { options })

            options = produce(options, draft => {
                draft.label = draft.new
            })

            logger.log(
                `Creating label ${logger.colors.green(options.label)} on ${logger.colors.green(
                    `${user}/${options.repo}`
                )}`
            )

            try {
                await createLabel(options, user)
            } catch (err) {
                throw new Error(`Can't create label.\n${err}`)
            }

            await afterHooks('repo.createLabel', { options })
        } else if (options.update) {
            await beforeHooks('repo.updateLabel', { options })

            options = produce(options, draft => {
                draft.label = draft.update
            })

            logger.log(
                `Updating label ${logger.colors.green(options.label)} on ${logger.colors.green(
                    `${user}/${options.repo}`
                )}`
            )

            try {
                var { status } = await updateLabel(options, user)
            } catch (err) {
                throw new Error(`Can't update label.\n${err}`)
            }

            status === 200 && logger.log('Success')

            await afterHooks('repo.updateLabel', { options })
        }
    } else if (options.list && !options.label) {
        await beforeHooks('repo.list', { options })

        options = produce(options, draft => {
            if (draft.organization) {
                user = options.organization
                draft.type = draft.type || TYPE_ALL
            } else {
                user = draft.user
                draft.type = draft.type || TYPE_OWNER
            }
        })

        // Add a isTTY value on the options to determine whether or not the command is executed in a TTY context or not.
        // Will be false if cmd is piped like: gh re --list | cat
        if (Boolean(process.stdout.isTTY)) {
            logger.log(
                `Listing ${logger.colors.green(options.type)} repos for ${logger.colors.green(
                    user
                )}`
            )
        }
        try {
            var listData = await list(options, user)
        } catch (err) {
            throw new Error(`Can't list repos.\n${err}`)
        }

        listCallback_(options, listData)

        await afterHooks('repo.list', { options })
    } else if (options.new && !options.label) {
        if (!options.new.trim()) {
            options = produce(options, draft => {
                draft.new = getCurrentFolderName()
            })
        }

        await beforeHooks('repo.new', { options })

        options = produce(options, draft => {
            draft.repo = draft.new

            if (draft.organization) {
                draft.user = draft.organization
            }
        })

        logger.log(
            `Creating a new repo on ${logger.colors.green(`${options.user}/${options.new}`)}`
        )

        try {
            var { data: repoData, options: updatedOptions } = await newRepo(options)
        } catch (err) {
            throw new Error(`Can't create new repo.\n${err}`)
        }

        logger.log(repoData.html_url)

        if (repoData && options.clone) {
            clone_(options.user, options.repo, repoData.ssh_url)
        }

        await afterHooks('repo.new', { options: updatedOptions })
    }

    done && done()
}

function browser(user, repo) {
    openUrl(`${config.github_host}/${user}/${repo}`)
}

function clone_(user, repo, repo_url) {
    logger.log(`Cloning ${logger.colors.green(`${user}/${repo}`)}`)
    git.clone(url.parse(repo_url).href, repo)
}

function createLabel(options, user): Promise<Octokit.IssuesCreateLabelResponse> {
    const payload: Octokit.IssuesCreateLabelParams = {
        owner: user,
        color: normalizeColor(options.color),
        name: options.new,
        repo: options.repo,
    }

    if (options.description) {
        payload.description = options.description
    }

    return options.GitHub.issues.createLabel(payload)
}

function deleteRepo(options, user, repo): Promise<Octokit.Response<Octokit.ReposDeleteResponse>> {
    const payload = {
        repo,
        owner: user,
    }

    return options.GitHub.repos.delete(payload)
}

function deleteLabel(options, user): Promise<Octokit.Response<Octokit.IssuesDeleteLabelResponse>> {
    const payload = {
        owner: user,
        name: options.delete,
        repo: options.repo,
    }

    return options.GitHub.issues.deleteLabel(payload)
}

/**
 * If user has a custom git_host defined we will use that (helpful for custom ssh rules).
 * Otherwise pluck it from the previously set up github_host.
 */
interface CloneOptions {
    repo: string
    user: string
    protocol?: string
    github_host?: string
}
type GetCloneUrl = (options: CloneOptions, customSshHost?: string) => string
export const getCloneUrl: GetCloneUrl = ({ repo, user, protocol, github_host }, customSshHost) => {
    const hostWithoutProtocol = github_host.split('://')[1]
    let repoUrl = `git@${customSshHost || hostWithoutProtocol}:${user}/${repo}.git`

    if (protocol === 'https') {
        repoUrl = `https://${hostWithoutProtocol}/${user}/${repo}.git`
    }

    return repoUrl
}

function getRepo(options): Promise<Octokit.Response<Octokit.IssuesGetResponse>> {
    const payload = {
        repo: options.repo,
        owner: options.user,
    }

    return options.GitHub.repos.get(payload)
}

function list(options, user): Promise<Octokit.AnyResponse | Octokit.ReposListForOrgResponse> {
    let method = 'listForUser'

    const payload: any = {
        type: options.type,
        per_page: 100,
    }

    if (options.organization) {
        method = 'listForOrg'
        payload.org = options.organization
    } else {
        payload.username = options.user
    }

    if (options.type === 'public' || options.type === 'private') {
        if (user === options.user) {
            method = 'listForUser'
        } else {
            logger.error('You can only list your own public and private repos.')
            return
        }
    }

    return options.GitHub.paginate(options.GitHub.repos[method].endpoint(payload))
}

function listCallback_(options, repos): void {
    let pos
    let repo

    if (repos && repos.length > 0) {
        for (pos in repos) {
            if (repos.hasOwnProperty(pos) && repos[pos].full_name) {
                repo = repos[pos]
                logger.log(repo.full_name)

                if (options.detailed) {
                    logger.log(logger.colors.blue(repo.html_url))

                    if (repo.description) {
                        logger.log(logger.colors.blue(repo.description))
                    }

                    if (repo.homepage) {
                        logger.log(logger.colors.blue(repo.homepage))
                    }

                    logger.log(`last update ${logger.getDuration(repo.updated_at, options.date)}`)
                }

                if (Boolean(process.stdout.isTTY)) {
                    logger.log(
                        `${logger.colors.green(
                            `forks: ${repo.forks}, stars: ${repo.watchers}, issues: ${
                                repo.open_issues
                            }`
                        )}\n`
                    )
                }
            }
        }
    }
}

function listLabels(
    options,
    user
): Promise<Octokit.Response<Octokit.IssuesListLabelsForRepoResponse>> {
    const payload: Octokit.IssuesListLabelsForRepoParams = {
        owner: user,
        repo: options.repo,
        ...(options.page && { page: options.page }),
        ...(options.per_page && { per_page: options.per_page }),
    }

    return options.GitHub.issues.listLabelsForRepo(payload)
}

function fork(options): Promise<Octokit.Response<Octokit.ReposCreateForkResponse>> {
    const payload: Octokit.ReposCreateForkParams = {
        owner: options.user,
        repo: options.repo,
    }

    if (options.organization) {
        payload.organization = options.organization
    }

    return options.GitHub.repos.createFork(payload)
}

async function newRepo(options) {
    let method = 'createForAuthenticatedUser'

    options = produce(options, draft => {
        draft.description = draft.description || ''
        draft.gitignore = draft.gitignore || ''
        draft.homepage = draft.homepage || ''
        draft.init = draft.init || false

        if (draft.type === TYPE_PRIVATE) {
            draft.private = true
        }

        draft.private = draft.private || false

        if (draft.gitignore) {
            draft.init = true
        }
    })

    const payload: any = {
        auto_init: options.init,
        description: options.description,
        gitignore_template: options.gitignore,
        homepage: options.homepage,
        name: options.new,
        private: options.private,
    }

    if (options.organization) {
        method = 'createInOrg'
        payload.org = options.organization
    }

    const { data } = await options.GitHub.repos[method](payload)

    return { data, options }
}

function updateLabel(options, user): Promise<Octokit.Response<Octokit.IssuesUpdateLabelResponse>> {
    const payload: Octokit.IssuesUpdateLabelParams = {
        owner: user,
        color: normalizeColor(options.color),
        current_name: options.update,
        repo: options.repo,
    }

    return options.GitHub.issues.updateLabel(payload)
}

function normalizeColor(color) {
    return color.includes('#') ? color.replace('#', '') : color
}
