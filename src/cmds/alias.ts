/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as base from '../base'
import * as configs from '../configs'
import * as logger from '../logger'

const config = base.getConfig()

// -- Constants ------------------------------------------------------------------------------------

export const DETAILS = {
    alias: 'al',
    description: 'Create alias for a username.',
    commands: ['add', 'list', 'remove'],
    options: {
        add: String,
        list: Boolean,
        remove: String,
        user: String,
    },
    shorthands: {
        a: ['--add'],
        l: ['--list'],
        r: ['--remove'],
        u: ['--user'],
    },
    payload(payload, options) {
        if (payload[0]) {
            options.add = payload[0]
            options.user = payload[1]
        } else {
            options.list = true
        }
    },
}

// -- Commands -------------------------------------------------------------------------------------
export const name = 'Alias'

export async function run(options) {
    if (options.add) {
        if (!options.user) {
            logger.error('You must specify an user, try --user username.')
        }

        logger.debug(`Creating alias ${options.add}`)
        add(options)
    }

    if (options.list) {
        list((_, data) => {
            let item

            for (item in data) {
                if (data.hasOwnProperty(item)) {
                    logger.log(`${logger.colors.cyan(item)}: ${logger.colors.magenta(data[item])}`)
                }
            }
        })
    }

    if (options.remove) {
        logger.debug(`Removing alias ${options.remove}`)
        remove(options)
    }
}

function add(options) {
    configs.writeGlobalConfig(`alias.${options.add}`, options.user)
}

function list(opt_callback) {
    opt_callback && opt_callback(null, config.alias)
}

function remove(options) {
    delete config.alias[options.remove]

    configs.writeGlobalConfig('alias', config.alias)
}
