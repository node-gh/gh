/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as configs from '../configs'
import * as logger from '../logger'

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
        if (options.user && options.token) {
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

User.logout = function() {
    configs.removeGlobalConfig('github_user')
    configs.removeGlobalConfig('github_token')
}
