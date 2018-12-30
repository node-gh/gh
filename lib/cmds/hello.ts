/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict'

// -- Requires -------------------------------------------------------------------------------------

var logger = require('../logger')

// -- Constructor ----------------------------------------------------------------------------------

function Hello(options) {
    this.options = options
}

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
    payload: function(payload, options) {
        options.world = true
    },
}

// -- Commands -------------------------------------------------------------------------------------

Hello.prototype.run = function() {
    var instance = this,
        options = instance.options

    if (options.world) {
        instance.world()
    }
}

Hello.prototype.world = function() {
    logger.log('hello world :)')
}

exports.Impl = Hello
