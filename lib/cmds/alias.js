/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict'

// -- Requires -------------------------------------------------------------------------------------

var base = require('../base'),
    configs = require('../configs'),
    logger = require('../logger'),
    config = base.getConfig()

// -- Constructor ----------------------------------------------------------------------------------

function Alias(options) {
    this.options = options
}

// -- Constants ------------------------------------------------------------------------------------

Alias.DETAILS = {
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
    payload: function(payload, options) {
        if (payload[0]) {
            options.add = payload[0]
            options.user = payload[1]
        } else {
            options.list = true
        }
    },
}

// -- Commands -------------------------------------------------------------------------------------

Alias.prototype.run = function() {
    var instance = this,
        options = instance.options

    if (options.add) {
        if (!options.user) {
            logger.error('You must specify an user, try --user username.')
        }

        logger.debug('Creating alias ' + options.add)
        instance.add()
    }

    if (options.list) {
        instance.list(function(err, data) {
            var item

            for (item in data) {
                if (data.hasOwnProperty(item)) {
                    logger.log(logger.colors.cyan(item) + ': ' + logger.colors.magenta(data[item]))
                }
            }
        })
    }

    if (options.remove) {
        logger.debug('Removing alias ' + options.remove)
        instance.remove()
    }
}

Alias.prototype.add = function() {
    var instance = this,
        options = instance.options

    configs.writeGlobalConfig('alias.' + options.add, options.user)
}

Alias.prototype.list = function(opt_callback) {
    opt_callback && opt_callback(null, config.alias)
}

Alias.prototype.remove = function() {
    var instance = this,
        options = instance.options

    delete config.alias[options.remove]

    configs.writeGlobalConfig('alias', config.alias)
}

exports.Impl = Alias
