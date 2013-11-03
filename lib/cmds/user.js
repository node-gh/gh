/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Elad Elrom <elad.ny@gmail.com>
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <eduardo.lundgren@gmail.com>
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var base = require('../base'),
    logger = require('../logger'),
    inquirer = require('inquirer'),
    config = base.getConfig();

// -- Constructor ----------------------------------------------------------------------------------

function User(options) {
    this.options = options;
}

// -- Constants ------------------------------------------------------------------------------------

User.DETAILS = {
    alias: 'us',
    description: 'Provides the ability to login and logout if needed.',
    commands: [
        'login',
        'logout'
    ],
    options: {
        'login': Boolean,
        'logout': Boolean
    },
    shorthands: {
        'l': ['--login'],
        'L': ['--logout']
    },
    payload: function(payload, options) {
        options.login = true;
    }
};

// -- Commands -------------------------------------------------------------------------------------

User.prototype.run = function() {
    var instance = this,
        options = instance.options;

    options.user = options.loggedUser;

    if (options.login) {
        if (User.hasCredentials()) {
            logger.logTemplate(
                '{{prefix}} [info] You\'re logged in as {{greenBright options.user}}', {
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

// -- Static ---------------------------------------------------------------------------------------

User.authorize = function() {
    config = base.getConfig();

    base.github.authenticate({
        type: 'oauth',
        token: config.github_token
    });
};

User.createAuthorization = function(opt_callback) {
    logger.log('First we need authorization to use GitHub\'s API. Login with your GitHub account.');

    inquirer.prompt(
        [
            {
                type: 'input',
                message: 'Enter your GitHub user',
                name: 'user'
            },
            {
                type: 'password',
                message: 'Enter your GitHub password',
                name: 'password'
            }
        ], function(answers) {
            var payload = {
                note: 'Node GH',
                note_url: 'https://github.com/eduardolundgren/node-gh',
                scopes: ['user', 'public_repo', 'repo', 'repo:status', 'delete_repo', 'gist']
            };

            base.github.authenticate({
                type: 'basic',
                username: answers.user,
                password: answers.password
            });

            base.github.authorization.create(payload, function(err, res) {
                logger.defaultCallback(err, null, 'Authentication succeed.');

                if (res.token) {
                    base.writeGlobalConfigCredentials(answers.user, res.token);

                    User.authorize();
                }

                opt_callback && opt_callback(err);
            });
        });
};

User.hasCredentials = function() {
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
