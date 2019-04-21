/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as Octokit from '@octokit/rest'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import * as openUrl from 'opn'
import * as url from 'url'
import * as base from '../base'
import * as git from '../git'
import { getGitHubInstance } from '../GitHub'
import { afterHooks, beforeHooks } from '../hooks'
import * as logger from '../logger'
import { getCurrentFolderName, hasCmdInOptions } from '../utils'

const config = base.getConfig()
const testing = process.env.NODE_ENV === 'testing'

// -- Constructor ----------------------------------------------------------------------------------

export default function Repo(options) {
    this.options = options
}

// -- Constants ------------------------------------------------------------------------------------

Repo.DETAILS = {
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

Repo.TYPE_ALL = 'all'
Repo.TYPE_FORKS = 'forks'
Repo.TYPE_MEMBER = 'member'
Repo.TYPE_OWNER = 'owner'
Repo.TYPE_PRIVATE = 'private'
Repo.TYPE_PUBLIC = 'public'
Repo.TYPE_SOURCES = 'sources'

// -- Commands -------------------------------------------------------------------------------------

Repo.prototype.run = async function(done) {
    const instance = this
    const options = instance.options
    let user = options.loggedUser

    instance.config = config
    instance.GitHub = await getGitHubInstance()

    if (
        !hasCmdInOptions(Repo.DETAILS.commands, options) &&
        options.browser !== false &&
        options.argv.cooked.length === 1
    ) {
        options.browser = true
    }

    if (options.browser) {
        instance.browser(options.user, options.repo)
    } else if (options.clone && !options.new) {
        beforeHooks('repo.get', instance)

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
            var { data } = await instance.get(user, options.repo)
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
            instance.clone_(user, options.repo, repoUrl)
        }

        afterHooks('repo.get', instance)
    } else if (options.delete && !options.label) {
        beforeHooks('repo.delete', instance)

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
                const { status } = await instance.delete(options.user, options.delete)

                status === 204 && logger.log('Successfully deleted repo.')
            } catch (err) {
                logger.error(`Can't delete repo.\n${err}`)
            }

            afterHooks('repo.delete', instance)
        } else {
            logger.log('Not deleted.')
        }
    } else if (options.fork) {
        beforeHooks('repo.fork', instance)

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
            var { data } = await instance.fork()
        } catch (err) {
            throw new Error(`Can't fork. ${err}`)
        }

        logger.log(`Successfully forked: ${data.html_url}`)

        if (data && options.clone) {
            instance.clone_(user, options.repo, data.ssh_url)
        }

        afterHooks('repo.fork', instance)
    } else if (options.label) {
        if (options.organization) {
            user = options.organization
        } else if (options.user) {
            user = options.user
        }

        if (options.delete) {
            beforeHooks('repo.deleteLabel', instance)

            options.label = options.delete

            logger.log(
                `Deleting label ${logger.colors.green(options.label)} on ${logger.colors.green(
                    `${user}/${options.repo}`
                )}`
            )

            try {
                var { status } = await instance.deleteLabel(user)
            } catch (err) {
                throw new Error(`Can't delete label.\n${err}`)
            }

            status === 204 && logger.log('Successful.')

            afterHooks('repo.deleteLabel', instance)
        } else if (options.list) {
            beforeHooks('repo.listLabels', instance)

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
                var { data } = await instance.listLabels(user)
            } catch (err) {
                throw new Error(`Can't list labels\n${err}`)
            }

            data.forEach(label => logger.log(logger.colors.yellow(label.name)))

            afterHooks('repo.listLabels', instance)
        } else if (options.new) {
            beforeHooks('repo.createLabel', instance)

            options.label = options.new

            logger.log(
                `Creating label ${logger.colors.green(options.label)} on ${logger.colors.green(
                    `${user}/${options.repo}`
                )}`
            )

            try {
                const { data } = await instance.createLabel(user)
                console.log('data', data)
            } catch (err) {
                throw new Error(`Can't create label.\n${err}`)
            }

            beforeHooks('repo.createLabel', instance)
        } else if (options.update) {
            beforeHooks('repo.updateLabel', instance)

            options.label = options.update

            logger.log(
                `Updating label ${logger.colors.green(options.label)} on ${logger.colors.green(
                    `${user}/${options.repo}`
                )}`
            )

            try {
                var { status } = await instance.updateLabel(user)
            } catch (err) {
                throw new Error(`Can't update label.\n${err}`)
            }

            status === 200 && logger.log('Success')

            beforeHooks('repo.updateLabel', instance)
        }
    } else if (options.list && !options.label) {
        if (options.organization) {
            user = options.organization
            options.type = options.type || Repo.TYPE_ALL
        } else {
            user = options.user
            options.type = options.type || Repo.TYPE_OWNER
        }

        if (options.isTTY.out) {
            logger.log(
                `Listing ${logger.colors.green(options.type)} repos for ${logger.colors.green(
                    user
                )}`
            )
        }
        try {
            var { data } = await instance.list(user)
        } catch (err) {
            throw new Error(`Can't list repos.\n${err}`)
        }

        instance.listCallback_(data)

        return
    } else if (options.new && !options.label) {
        if (!options.new.trim()) {
            options.new = getCurrentFolderName()
        }

        beforeHooks('repo.new', instance)

        options.repo = options.new

        if (options.organization) {
            options.user = options.organization
        }

        logger.log(
            `Creating a new repo on ${logger.colors.green(`${options.user}/${options.new}`)}`
        )

        try {
            var { data } = await instance.new()
        } catch (err) {
            throw new Error(`Can't create new repo.\n${err}`)
        }

        logger.log(data.html_url)

        if (data && options.clone) {
            instance.clone_(options.user, options.repo, data.ssh_url)
        }

        afterHooks('repo.new', instance)
    }

    done && done()
}

Repo.prototype.browser = function(user, repo) {
    !testing && openUrl(`${config.github_host}/${user}/${repo}`, { wait: false })
}

Repo.prototype.clone_ = function(user, repo, repo_url) {
    logger.log(`Cloning ${logger.colors.green(`${user}/${repo}`)}`)
    git.clone(url.parse(repo_url).href, repo)
}

Repo.prototype.createLabel = async function(user): Promise<Octokit.IssuesCreateLabelResponse> {
    const instance = this
    const options = instance.options

    const payload: Octokit.IssuesCreateLabelParams = {
        owner: user,
        color: options.color,
        name: options.new,
        repo: options.repo,
    }

    if (options.description) {
        payload.description = options.description
    }

    return await instance.GitHub.issues.createLabel(payload)
}

Repo.prototype.delete = async function(user, repo): Promise<Octokit.ReposDeleteResponse> {
    const instance = this
    const payload = {
        repo,
        owner: user,
    }

    return await instance.GitHub.repos.delete(payload)
}

Repo.prototype.deleteLabel = async function(user): Promise<Octokit.IssuesDeleteLabelResponse> {
    const instance = this
    const options = instance.options

    const payload = {
        owner: user,
        name: options.delete,
        repo: options.repo,
    }

    return await instance.GitHub.issues.deleteLabel(payload)
}

Repo.prototype.get = async function(user, repo): Promise<Octokit.IssuesGetResponse> {
    const instance = this

    const payload = {
        repo,
        owner: user,
    }

    return await instance.GitHub.repos.get(payload)
}

Repo.prototype.list = async function(
    user
): Promise<Octokit.AnyResponse | Octokit.ReposListForOrgResponse> {
    const instance = this
    const options = instance.options

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

    return await instance.GitHub.repos[method](payload)
}

Repo.prototype.listCallback_ = function(repos): void {
    const instance = this
    const options = instance.options
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

                if (options.isTTY.out) {
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

Repo.prototype.listLabels = async function(user): Promise<Octokit.IssuesListLabelsForRepoResponse> {
    const instance = this
    const options = instance.options

    const payload: Octokit.IssuesListLabelsForRepoParams = {
        owner: user,
        repo: options.repo,
        ...(options.page && { page: options.page }),
        ...(options.per_page && { per_page: options.per_page }),
    }

    return await instance.GitHub.issues.listLabelsForRepo(payload)
}

Repo.prototype.listLabelsCallback_ = function(err, labels): void {
    const instance = this
    const options = instance.options

    if (err && !options.all) {
        logger.error(logger.getErrorMessage(err))
    }

    if (labels && labels.length > 0) {
        labels.forEach(label => {
            logger.log(logger.colors.yellow(label.name))
        })
    }
}

Repo.prototype.fork = async function(): Promise<Octokit.ReposCreateForkResponse> {
    const instance = this
    const options = instance.options

    const payload: Octokit.ReposCreateForkParams = {
        owner: options.user,
        repo: options.repo,
    }

    if (options.organization) {
        payload.organization = options.organization
    }

    return await instance.GitHub.repos.createFork(payload)
}

Repo.prototype.new = async function(): Promise<
    Octokit.ReposCreateInOrgResponse | Octokit.ReposCreateForAuthenticatedUserResponse
> {
    const instance = this
    const options = instance.options
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

    return await instance.GitHub.repos[method](payload)
}

Repo.prototype.updateLabel = async function(user): Promise<Octokit.IssuesUpdateLabelResponse> {
    const instance = this
    const options = instance.options

    const payload: Octokit.IssuesUpdateLabelParams = {
        owner: user,
        color: options.color,
        current_name: options.update,
        repo: options.repo,
    }

    return await instance.GitHub.issues.updateLabel(payload)
}
