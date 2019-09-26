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
const TYPE_FORKS = 'forks'
const TYPE_MEMBER = 'member'
const TYPE_OWNER = 'owner'
const TYPE_PRIVATE = 'private'
const TYPE_PUBLIC = 'public'
const TYPE_SOURCES = 'sources'

// -- Commands -------------------------------------------------------------------------------------

export async function run(options, done) {
    let user = options.loggedUser

    config = config

    if (
        !userRanValidFlags(DETAILS.commands, options) &&
        options.browser !== false &&
        options.argv.cooked.length === 1
    ) {
        options.browser = true
    }

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
            var { data } = await get(user, options.repo)
        } catch (err) {
            throw new Error(
                `Can't clone ${logger.colors.green(`${user}/${options.repo}`)}. ${
                    JSON.parse(err).message
                }\n${err}`
            )
        }

        logger.log(data.html_url)

        let repoUrl

        if (options.protocol) {
            if (options.protocol === 'https') {
                repoUrl = `https://github.com/${user}/${options.repo}.git`
            }
        } else {
            repoUrl = `git@github.com:${user}/${options.repo}.git`
        }

        if (data) {
            clone_(user, options.repo, repoUrl)
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
                const { status } = await deleteRepo(options.user, options.delete)

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

        options.repo = options.fork

        logger.log(
            `Forking repo ${logger.colors.green(
                `${options.user}/${options.repo}`
            )} into ${logger.colors.green(`${user}/${options.repo}`)}`
        )

        try {
            var { data } = await fork()
        } catch (err) {
            throw new Error(`Can't fork. ${err}`)
        }

        logger.log(`Successfully forked: ${data.html_url}`)

        if (data && options.clone) {
            clone_(user, options.repo, data.ssh_url)
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

            options.label = options.delete

            logger.log(
                `Deleting label ${logger.colors.green(options.label)} on ${logger.colors.green(
                    `${user}/${options.repo}`
                )}`
            )

            try {
                var { status } = await deleteLabel(user)
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
                var { data } = await listLabels(user)
            } catch (err) {
                throw new Error(`Can't list labels\n${err}`)
            }

            data.forEach(label => logger.log(logger.colors.yellow(label.name)))

            await afterHooks('repo.listLabels', { options })
        } else if (options.new) {
            await beforeHooks('repo.createLabel', { options })

            options.label = options.new

            logger.log(
                `Creating label ${logger.colors.green(options.label)} on ${logger.colors.green(
                    `${user}/${options.repo}`
                )}`
            )

            try {
                await createLabel(user)
            } catch (err) {
                throw new Error(`Can't create label.\n${err}`)
            }

            await afterHooks('repo.createLabel', { options })
        } else if (options.update) {
            await beforeHooks('repo.updateLabel', { options })

            options.label = options.update

            logger.log(
                `Updating label ${logger.colors.green(options.label)} on ${logger.colors.green(
                    `${user}/${options.repo}`
                )}`
            )

            try {
                var { status } = await updateLabel(user)
            } catch (err) {
                throw new Error(`Can't update label.\n${err}`)
            }

            status === 200 && logger.log('Success')

            await afterHooks('repo.updateLabel', { options })
        }
    } else if (options.list && !options.label) {
        await beforeHooks('repo.list', { options })

        if (options.organization) {
            user = options.organization
            options.type = options.type || Repo.TYPE_ALL
        } else {
            user = options.user
            options.type = options.type || Repo.TYPE_OWNER
        }

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
            var data = await list(user)
        } catch (err) {
            throw new Error(`Can't list repos.\n${err}`)
        }

        listCallback_(data)

        await afterHooks('repo.list', { options })
    } else if (options.new && !options.label) {
        if (!options.new.trim()) {
            options.new = getCurrentFolderName()
        }

        await beforeHooks('repo.new', { options })

        options.repo = options.new

        if (options.organization) {
            options.user = options.organization
        }

        logger.log(
            `Creating a new repo on ${logger.colors.green(`${options.user}/${options.new}`)}`
        )

        try {
            var { data } = await newRepo(options)
        } catch (err) {
            throw new Error(`Can't create new repo.\n${err}`)
        }

        logger.log(data.html_url)

        if (data && options.clone) {
            clone_(options.user, options.repo, data.ssh_url)
        }

        await afterHooks('repo.new', { options })
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

function deleteRepo(user, repo): Promise<Octokit.ReposDeleteResponse> {
    const payload = {
        repo,
        owner: user,
    }

    return options.GitHub.repos.delete(payload)
}

function deleteLabel(options, user): Promise<Octokit.IssuesDeleteLabelResponse> {
    const payload = {
        owner: user,
        name: options.delete,
        repo: options.repo,
    }

    return options.GitHub.issues.deleteLabel(payload)
}

function get(user, repo): Promise<Octokit.IssuesGetResponse> {
    const payload = {
        repo,
        owner: user,
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

function listLabels(options, user): Promise<Octokit.IssuesListLabelsForRepoResponse> {
    const payload: Octokit.IssuesListLabelsForRepoParams = {
        owner: user,
        repo: options.repo,
        ...(options.page && { page: options.page }),
        ...(options.per_page && { per_page: options.per_page }),
    }

    return options.GitHub.issues.listLabelsForRepo(payload)
}

function listLabelsCallback_(options, err, labels): void {
    if (err && !options.all) {
        logger.error(logger.getErrorMessage(err))
    }

    if (labels && labels.length > 0) {
        labels.forEach(label => {
            logger.log(logger.colors.yellow(label.name))
        })
    }
}

async function fork(options): Promise<Octokit.ReposCreateForkResponse> {
    const payload: Octokit.ReposCreateForkParams = {
        owner: options.user,
        repo: options.repo,
    }

    if (options.organization) {
        payload.organization = options.organization
    }

    return await options.GitHub.repos.createFork(payload)
}

function newRepo(
    options
): Promise<Octokit.ReposCreateInOrgResponse | Octokit.ReposCreateForAuthenticatedUserResponse> {
    let method = 'createForAuthenticatedUser'

    options.description = options.description || ''
    options.gitignore = options.gitignore || ''
    options.homepage = options.homepage || ''
    options.init = options.init || false

    if (options.type === Repo.TYPE_PRIVATE) {
        options.private = true
    }

    options.private = options.private || false

    if (options.gitignore) {
        options.init = true
    }

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

    return options.GitHub.repos[method](payload)
}

function updateLabel(options, user): Promise<Octokit.IssuesUpdateLabelResponse> {
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
