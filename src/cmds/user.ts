/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as fs from 'fs'
import * as inquirer from 'inquirer'
import * as moment from 'moment'
import * as userhome from 'userhome'
import * as base from '../base'
import * as configs from '../configs'
import * as logger from '../logger'

const config = configs.getConfig()
const testing = process.env.NODE_ENV === 'testing'

// -- Constructor ----------------------------------------------------------------------------------

export default function User(options) {
    this.options = options
}

// -- Constants ------------------------------------------------------------------------------------

User.DETAILS = {
    alias: 'us',
    description: 'Provides the ability to login and logout if needed.',
    commands: ['login', 'logout', 'whoami'],
    options: {
        login: Boolean,
        logout: Boolean,
        whoami: Boolean,
    },
    shorthands: {
        l: ['--login'],
        L: ['--logout'],
        w: ['--whoami'],
    },
    payload(payload, options) {
        options.login = true
    },
}

// -- Commands -------------------------------------------------------------------------------------

User.prototype.run = function() {
    const instance = this
    const options = instance.options

    if (options.login) {
        if (User.hasCredentials()) {
            logger.log(`You're logged in as ${logger.colors.green(options.user)}`)
        }
    }

    if (options.logout) {
        logger.log(`Logging out of user ${logger.colors.green(options.user)}`)

        !testing && User.logout()
    }

    if (options.whoami) {
        logger.log(options.user)
    }
}

// -- Static ---------------------------------------------------------------------------------------

User.authorize = function() {
    base.github.authenticate({
        type: 'oauth',
        token: getCorrectToken(configs.getConfig()),
    })
}

User.writeToken = function(user, res) {
    if (res.token) {
        configs.writeGlobalConfigCredentials(user, res.token)

        User.authorize()
    }

    logger.log('Authentication succeed.')
}

User.createAuthorization = async function() {
    logger.log("First we need authorization to use GitHub's API. Login with your GitHub account.")

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

    base.github.authenticate({
        type: 'basic',
        username: answers.user,
        password: answers.password,
    })

    try {
        const result = await base.github.oauthAuthorizations.createAuthorization(payload)

        User.writeToken(answers.user, result)
    } catch (err) {
        const isTwoFactorAuthentication = err && err.message && err.message.indexOf('OTP') > 0

        if (isTwoFactorAuthentication) {
            User.twoFactorAuthenticator_(payload, answers.user)
        } else {
            throw new Error(`Error creating a token on GitHub\n${err}`)
        }
    }
}

User.hasCredentials = function() {
    if (
        (config.github_token && config.github_user) ||
        (process.env.GH_TOKEN && process.env.GH_USER)
    ) {
        return true
    }

    return false
}

User.login = async function() {
    if (User.hasCredentials()) {
        User.authorize()
    } else {
        await User.createAuthorization()
    }
}

User.logout = function() {
    configs.removeGlobalConfig('github_user')
    configs.removeGlobalConfig('github_token')
}

User.twoFactorAuthenticator_ = async function(payload, user) {
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

    const results = await base.github.oauthAuthorizations.createAuthorization(payload)

    User.writeToken(user, results)
}

function getCorrectToken(config) {
    if (process.env.CONTINUOUS_INTEGRATION) {
        return process.env.GH_TOKEN
    }
    if (process.env.NODE_ENV === 'testing') {
        // Load your local token when generating test fixtures
        return JSON.parse(fs.readFileSync(userhome('.gh.json')).toString()).github_token
    }

    return config.github_token
}
