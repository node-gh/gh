/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as logger from '../logger'
import { userRanValidFlags } from '../utils'
import { produce } from 'immer'

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
}

// -- Commands -------------------------------------------------------------------------------------

export function run(options) {
    if (!userRanValidFlags(DETAILS.commands, options)) {
        options = produce(options, draft => {
            draft.world = true
        })
    }

    if (options.world) {
        world()
    }
}

function world() {
    logger.log('hello world :)')
}
