/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as configs from '../configs'
import { tokenExists } from '../github'
import * as logger from '../logger'
import { userRanValidFlags } from '../utils'

const testing = process.env.NODE_ENV === 'testing'

// -- Constants ------------------------------------------------------------------------------------

export const DETAILS = {
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
}

// -- Commands -------------------------------------------------------------------------------------
export const name = 'User'

export async function run(options, done) {
    let login = options.login

    if (!userRanValidFlags(DETAILS.commands, options)) {
        login = true
    }

    if (login) {
        if (tokenExists()) {
            logger.log(`You're logged in as ${logger.colors.green(options.user)}`)
        } else {
            done && done()
        }
    }

    if (options.logout) {
        logger.log(`Logging out of user ${logger.colors.green(options.user)}`)

        !testing && logout()
    }

    if (options.whoami) {
        logger.log(options.user)
    }
}

// -- Static ---------------------------------------------------------------------------------------

function logout() {
    configs.removeGlobalConfig('github_user')
    configs.removeGlobalConfig('github_token')
}
