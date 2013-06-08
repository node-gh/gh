/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Elad Elrom <elad.ny@gmail.com>
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <eduardo.lundgren@gmail.com>
 */

// -- Requires -----------------------------------------------------------------
var base = require('../base'),
    logger = require('../logger'),
    prompt = require('prompt');

// -- Constructor --------------------------------------------------------------
function User(options) {
    this.options = options;
}

// -- Constants ----------------------------------------------------------------
User.DETAILS = {
    alias: 'us',
    description: 'Provides the ability to login and logout if needed.',
    options: {
        'login' : Boolean,
        'logout': Boolean,
        'remote': String
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
        if (User.hasCredentials()) {
            logger.logTemplate('{{prefix}} [info] You\'re logged in as {{greenBright options.user}}', {
                options: options
            });
        }
    }

    if (options.logout) {
        logger.logTemplate('{{prefix}} [info] Logging out of user {{greenBright options.user}}', {
            options: options
        });

        User.logout();
    }
};

// -- Static -------------------------------------------------------------------
User.authorize = function() {
    var config = base.getGlobalConfig();

    base.github.authenticate({
        type: 'oauth',
        token: config.github_token
    });
};

User.createAuthorization = function(opt_callback) {
    logger.log('First we need authorization to use GitHub\'s API. Login with your GitHub account.');

    prompt.get([{
        name: 'username',
        message: 'Username',
        empty: false
    },
    {
        name: 'password',
        message: 'Password',
        empty: false,
        hidden: true
    }],
    function(err, result) {
        var payload = {
            note: 'Node GH',
            note_url: 'https://github.com/eduardolundgren/node-gh',
            scopes: [ 'user', 'public_repo', 'repo', 'repo:status', 'gist' ]
        };

        base.github.authenticate({
            type: 'basic',
            username: result.username,
            password: result.password
        });

        base.github.authorization.create(payload, function(err, res) {
            logger.defaultCallback(err, null, 'Authentication completed.');

            if (res.token) {
                base.writeGlobalConfigCredentials(result.username, res.token);
                User.authorize();
            }

            opt_callback && opt_callback(err);
        });
    });
};

User.hasCredentials = function() {
    var config = base.getGlobalConfig();

    if (config.github_token && config.github_user) {
        return true;
    }

    return false;
};

User.login = function(opt_callback) {
    if (User.hasCredentials()) {
        User.authorize();
        opt_callback && opt_callback();
    }
    else {
        User.createAuthorization(opt_callback);
    }
};

User.logout = function() {
    base.removeGlobalConfig('github_user');
    base.removeGlobalConfig('github_token');
};

exports.Impl = User;