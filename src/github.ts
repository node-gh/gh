/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as Octokit from '@octokit/rest'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import * as moment from 'moment'
import { join } from 'path'
import * as userhome from 'userhome'
import { getConfig, writeGlobalConfigCredentials } from './configs'
import * as logger from './logger'
import { URL } from 'url'

const config = getConfig()

export async function getGitHubInstance(): Promise<Octokit> {
    const {
        api: { protocol, pathPrefix, host },
    } = config

    const is_enterprise = host !== 'api.github.com'

    const apiUrl = `${protocol}://${is_enterprise ? host : 'api.github.com'}`

    const { href } = new URL(`${apiUrl}${pathPrefix || ''}`)

    // trim trailing slash for Octokit
    const baseUrl = href.replace(/\/+$/, '')

    const token = await getToken()

    const throttlePlugin = await import('@octokit/plugin-throttling')

    Octokit.plugin(throttlePlugin)

    return new Octokit({
        // log: console,
        baseUrl,
        auth: token,
        throttle: {
            onRateLimit: (retryAfter, options) => {
                console.warn(`Request quota exhausted for request ${options.method} ${options.url}`)

                if (options.request.retryCount === 0) {
                    // only retries once
                    console.log(`Retrying after ${retryAfter} seconds!`)
                    return true
                }
            },
            onAbuseLimit: (_, options) => {
                // does not retry, only logs a warning
                console.warn(`Abuse detected for request ${options.method} ${options.url}`)
            },
        },
    })
}

export async function getToken(): Promise<string> {
    let token

    if (!tokenExists()) {
        token = await createNewOathToken()
    } else {
        token = getSavedToken()
    }

    if (token) {
        return token
    }

    process.exit(1)
}

export function tokenExists(): boolean {
    if (process.env.GENERATE_NEW_TOKEN) {
        return false
    }

    return (
        (config.github_token && config.github_user) || (process.env.GH_TOKEN && process.env.GH_USER)
    )
}

function getSavedToken(): string {
    if (process.env.CONTINUOUS_INTEGRATION) {
        return process.env.GH_TOKEN
    }
    if (process.env.NODE_ENV === 'testing') {
        // Load your local token when generating test fixtures
        return JSON.parse(fs.readFileSync(userhome('.gh.json')).toString()).github_token
    }

    return config.github_token
}

async function createNewOathToken(): Promise<string | undefined> {
    logger.log(`In order to use GitHub's API, you will need to login with your GitHub account.`)

    interface Answers {
        username: string
        password: string
    }

    const answers: Answers = await inquirer.prompt([
        {
            type: 'input',
            message: 'Enter your GitHub user',
            name: 'username',
        },
        {
            type: 'password',
            message: 'Enter your GitHub password',
            name: 'password',
        },
    ])

    const octokit = new Octokit({
        auth: {
            username: answers.username,
            password: answers.password,
            async on2fa() {
                const { code } = await inquirer.prompt([
                    {
                        type: 'input',
                        message: 'Enter your Two-factor GitHub authenticator code',
                        name: 'code',
                    },
                ])

                return code
            },
        },
    })

    const payload = {
        note: `Node GH (${moment().format('MMMM Do YYYY, h:mm:ss a')})`,
        note_url: 'https://github.com/node-gh/gh',
        scopes: ['user', 'public_repo', 'repo', 'repo:status', 'delete_repo', 'gist'],
    }

    try {
        var { data } = await octokit.oauthAuthorizations.createAuthorization(payload)
    } catch (err) {
        throw new Error(`Error creating GitHub token\n${err.message}`)
    }

    if (data.token) {
        writeGlobalConfigCredentials(
            answers.username,
            data.token,
            process.env.GENERATE_NEW_TOKEN && join(__dirname, '../__tests__/auth.json')
        )

        return data.token
    }

    logger.log(`Was not able to retrieve token from GitHub's api`)
}
