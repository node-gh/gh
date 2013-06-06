/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Elad Elrom
 */

// -- Requires -----------------------------------------------------------------
var base = require('../base'),
    logger = require('../logger');

// -- Constructor --------------------------------------------------------------
function Log(options) {
    this.options = options;
}

// -- Constants ----------------------------------------------------------------
Log.DETAILS = {
    description: 'Provides the ability to logout if needed and re-login',
    options: {
        'login': Boolean,
        'logout': Boolean,
        'user': String,
        'password': String
    },
    shorthands: {
        'i': [ '--login' ],
        'o': [ '--logout' ],
        'u': [ '--user' ],
        'p': [ '--password' ]
    }
};

// -- Commands -----------------------------------------------------------------
Log.prototype.run = function() {
    var instance = this,
        options = instance.options;
        options.login = options.login || instance.logout();
        options.logout = options.logout || instance.login(options);
};

function opt_callback() {
    // implement
}

Log.prototype.login = function(options) {
    base.createAuthorization(opt_callback);
};

Log.prototype.logout = function() {
    base.logout();
};

exports.Impl = Log;