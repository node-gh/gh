/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as logger from '../logger'

// -- Constructor ----------------------------------------------------------------------------------

export default function Hello() {}

// -- Constants ------------------------------------------------------------------------------------

Hello.DETAILS = {
    alias: 'he',
    description: 'Hello world example. Copy to start a new command.',
    commands: ['world'],
    options: {
        world: Boolean,
    },
    shorthands: {
        w: ['--world'],
    },
    payload(payload, options) {
        options.world = true
    },
}

// -- Commands -------------------------------------------------------------------------------------

Hello.prototype.run = function(options) {
    const instance = this

    if (options.world) {
        instance.world()
    }
}

Hello.prototype.world = function() {
    logger.log('hello world :)')
}
