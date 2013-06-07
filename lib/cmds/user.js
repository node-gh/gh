/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Elad Elrom <elad.ny@gmail.com>
 * @author Zeno Rocha <zno.rocha@gmail.com>
 */

// -- Requires -----------------------------------------------------------------
var base = require('../base'),
    logger = require('../logger');

// -- Constructor --------------------------------------------------------------
function User(options) {
    this.options = options;
}

// -- Constants ----------------------------------------------------------------
User.DETAILS = {
    alias: 'us',
    description: 'Provides the ability to logout if needed and re-login.',
    options: {
        'login' : Boolean,
        'logout': Boolean,
        'remote'  : String
    },
    shorthands: {
        'l': [ '--login' ],
        'L': [ '--logout' ]
    },
    payload: function(payload, options) {
        options.login = true;
    }
};

// -- Commands -----------------------------------------------------------------
User.prototype.run = function() {
    var instance = this,
        options = instance.options;

    if (options.login) {
        logger.logTemplate('{{prefix}} [info] You\'re already logged in as {{greenBright options.user}}', {
            options: options
        });
    }

    if (options.logout) {
        logger.logTemplate('{{prefix}} [info] Logging out of user {{greenBright options.user}}', {
            options: options
        });

        instance.logout();
    }
};

User.prototype.logout = function() {
    base.logout();
};

exports.Impl = User;