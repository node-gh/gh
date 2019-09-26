/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as inquirer from 'inquirer'
import { openUrl, userRanValidFlags } from '../utils'
import * as base from '../base'
import { afterHooks, beforeHooks } from '../hooks'
import * as logger from '../logger'
import { produce } from 'immer'

const config = base.getConfig()

// -- Constants ------------------------------------------------------------------------------------

export const name = 'Gists'
export const DETAILS = {
    alias: 'gi',
    description: 'Provides a set of util commands to work with Gists.',
    commands: ['browser', 'delete', 'fork', 'list', 'new'],
    options: {
        browser: Boolean,
        content: String,
        date: String,
        delete: [String, Array],
        description: String,
        fork: String,
        id: String,
        list: Boolean,
        new: String,
        private: Boolean,
        user: String,
    },
    shorthands: {
        B: ['--browser'],
        c: ['--content'],
        D: ['--delete'],
        d: ['--description'],
        f: ['--fork'],
        i: ['--id'],
        l: ['--list'],
        N: ['--new'],
        p: ['--private'],
        u: ['--user'],
    },
}

// -- Commands -------------------------------------------------------------------------------------

export async function run(options, done) {
    if (!userRanValidFlags(DETAILS.commands, options)) {
        options = produce(options, draft => {
            draft.list = true
        })
    }

    if (options.browser) {
        browser(options.id || options.loggedUser)
    }

    if (options.delete) {
        options.delete

        const answers = await inquirer.prompt([
            {
                type: 'input',
                message: 'Are you sure? This action CANNOT be undone. [y/N]',
                name: 'confirmation',
            },
        ])

        if (
            answers.confirmation.toLowerCase() === 'n' ||
            answers.confirmation.toLowerCase() === ''
        ) {
            console.log('Not deleted.')
            return
        }

        for (const gist_id of options.delete) {
            logger.log(`Deleting gist ${logger.colors.green(`${options.loggedUser}/${gist_id}`)}`)

            await beforeHooks('gists.delete', { options })

            await _deleteHandler(options, gist_id)

            await afterHooks('gists.delete', { options })
        }
    }

    if (options.fork) {
        await beforeHooks('gists.fork', { options })

        logger.log(`Forking gist on ${logger.colors.green(options.loggedUser)}`)

        try {
            var { data } = await fork(options, options.fork)
        } catch (err) {
            throw new Error(`Cannot fork gist.\n${err}`)
        }

        logger.log(data.html_url)

        await afterHooks('gists.fork', { options })
    }

    if (options.list) {
        logger.log(`Listing gists for ${logger.colors.green(options.user)}`)

        try {
            var data = await list(options, options.user)
        } catch (err) {
            throw new Error(`Can't list gists for ${options.user}.`)
        }

        listCallback_(data, options.date)
    }

    if (options.new) {
        const privacy = options.private ? 'private' : 'public'

        await beforeHooks('gists.new', { options })

        logger.log(
            `Creating ${logger.colors.magenta(privacy)} gist on ${logger.colors.green(
                options.loggedUser
            )}`
        )

        try {
            var { data } = await newGist(options, options.new, options.content)
        } catch (err) {
            throw new Error(`Can't create gist.\n${err}`)
        }

        if (data) {
            options = produce(options, draft => {
                draft.id = data.id
            })

            logger.log(data.html_url)
        }

        await afterHooks('gists.new', { options })
    }

    done && done()
}

function browser(gist) {
    openUrl(config.github_gist_host + gist)
}

function deleteGist(options, id) {
    const payload = {
        gist_id: id,
    }

    return options.GitHub.gists.delete(payload)
}

function fork(options, id) {
    const payload = {
        gist_id: id,
    }

    return options.GitHub.gists.fork(payload)
}

async function list(options, user) {
    const payload = {
        username: user,
    }

    return options.GitHub.paginate(options.GitHub.gists.listPublicForUser.endpoint(payload))
}

function listCallback_(gists, date) {
    if (gists && gists.length > 0) {
        gists.forEach(gist => {
            const duration = logger.getDuration(gist.updated_at, date)

            logger.log(`${logger.colors.yellow(`${gist.owner.login}/${gist.id}`)} ${duration}`)

            if (gist.description) {
                logger.log(gist.description)
            }

            logger.log(`${logger.colors.blue(gist.html_url)}\n`)
        })
    }
}

function newGist(options, name, content) {
    let file = {}

    options = produce(options, draft => {
        draft.description = draft.description || ''
    })

    file[name] = {
        content,
    }

    const payload = {
        description: options.description,
        files: file,
        public: !options.private,
    }

    return options.GitHub.gists.create(payload)
}

async function _deleteHandler(options, gist_id) {
    try {
        var { status } = await deleteGist(options, gist_id)
    } catch (err) {
        throw new Error(`Can't delete gist: ${gist_id}.`)
    }

    status === 204 && logger.log(`Successfully deleted gist: ${gist_id}`)
}
