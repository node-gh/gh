/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as logger from '../logger'

// -- Constants ------------------------------------------------------------------------------------

export const name = 'Hello'
export const DETAILS = {
    alias: 'he',
    description: 'Hello world example. Copy to start a new command.',
    commands: ['world'],
    options: {
        world: Boolean,
    },
    shorthands: {
        w: ['--world'],
    },
    payload(_, options) {
        options.world = true
    },
}

// -- Commands -------------------------------------------------------------------------------------

function run(options) {
    if (options.world) {
        world()
    }
}

function world() {
    logger.log('hello world :)')
}
