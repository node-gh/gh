/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as Octokit from '@octokit/rest'
import * as fs from 'fs'
import * as inquirer from 'inquirer'
import * as moment from 'moment'
import * as userhome from 'userhome'
import { getConfig, writeGlobalConfigCredentials } from './configs'
import * as logger from './logger'

const config = getConfig()

export async function getGitHubInstance(): Promise<Octokit> {
    const baseUrl =
        config.github_host === 'https://github.com' ? 'https://api.github.com' : config.github_host

    return new Octokit({ baseUrl, auth: await getToken() })
}

export async function getToken(): Promise<string> {
    let token

    if (tokenExists()) {
        token = getSavedToken()
    } else {
        token = await createNewOathToken()
    }

    if (token) {
        return token
    }

    process.exit(1)
}

function tokenExists(): boolean {
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

    const answers = await inquirer.prompt([
        {
            type: 'input',
            message: 'Enter your GitHub user',
            name: 'user',
        },
        {
            type: 'password',
            message: 'Enter your GitHub password',
            name: 'password',
        },
    ])

    const payload = {
        note: `Node GH (${moment().format('MMMM Do YYYY, h:mm:ss a')})`,
        note_url: 'https://github.com/node-gh/gh',
        scopes: ['user', 'public_repo', 'repo', 'repo:status', 'delete_repo', 'gist'],
    }

    let response

    try {
        response = await new Octokit().oauthAuthorizations.createAuthorization(payload)
    } catch (err) {
        const isTwoFactorAuthentication = err && err.message && err.message.indexOf('OTP') > 0

        if (isTwoFactorAuthentication) {
            response = await twoFactorAuthenticator(payload)
        } else {
            throw new Error(`Error creating GitHub token\n${err}`)
        }
    }

    if (response.data.token) {
        writeGlobalConfigCredentials(answers.user, response.data.token)

        return response.data.token
    }

    logger.log(`Was not able to retrieve token from GitHub's api`)
}

async function twoFactorAuthenticator(
    payload
): Promise<Octokit.Response<Octokit.OauthAuthorizationsCreateAuthorizationResponse>> {
    const factor = await inquirer.prompt([
        {
            type: 'input',
            message: 'Enter your two-factor code',
            name: 'otp',
        },
    ])

    if (!payload.headers) {
        payload.headers = []
    }

    payload.headers['X-GitHub-OTP'] = factor.otp

    return await new Octokit().oauthAuthorizations.createAuthorization(payload)
}
