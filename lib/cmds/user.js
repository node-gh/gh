/*
 * Copyright 2013-2015, All Rights Reserved.
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
    configs = require('../configs'),
    logger = require('../logger'),
    inquirer = require('inquirer'),
    moment = require('moment'),
    config = configs.getConfig();

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
        'logout',
        'whoami'
    ],
    options: {
        'login': Boolean,
        'logout': Boolean,
        'whoami': Boolean
    },
    shorthands: {
        'l': ['--login'],
        'L': ['--logout'],
        'w': ['--whoami']
    },
    payload: function (payload, options) {
        options.login = true;
    }
};

// -- Commands -------------------------------------------------------------------------------------

User.prototype.run = function () {
    var instance = this,
        options = instance.options;

    options.user = options.loggedUser;

    if (options.login) {
        if (User.hasCredentials()) {
            logger.log('You\'re logged in as ' + logger.colors.green(options.user));
        }
    }

    if (options.logout) {
        logger.log('Logging out of user ' + logger.colors.green(options.user));

        User.logout();
    }

    if (options.whoami) {
        logger.log(options.user);
    }
};

// -- Static ---------------------------------------------------------------------------------------

User.authorize = function () {
    config = configs.getConfig();

    base.github.authenticate({
        type: 'oauth',
        token: config.github_token
    });
};

User.authorizationCallback_ = function (user, err, res) {
    if (err) {
        logger.error(err);
        return;
    }

    if (res.token) {
        configs.writeGlobalConfigCredentials(user, res.token);

        User.authorize();
    }

    logger.log('Authentication succeed.');
};

User.createAuthorization = function (opt_callback) {
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
        ], function (answers) {
            var payload = {
                note: 'Node GH (' + moment().format('MMMM Do YYYY, h:mm:ss a') + ')',
                note_url: 'https://github.com/eduardolundgren/node-gh',
                scopes: ['user', 'public_repo', 'repo', 'repo:status', 'delete_repo', 'gist']
            };

            base.github.authenticate({
                type: 'basic',
                username: answers.user,
                password: answers.password
            });

            base.github.authorization.create(payload, function (err, res) {
                var isTwoFactorAuthentication = err && err.message && err.message.indexOf('OTP') > 0;

                if (isTwoFactorAuthentication) {
                    User.twoFactorAuthenticator_(payload, answers.user, opt_callback);
                }
                else {
                    User.authorizationCallback_(answers.user, err, res);
                    opt_callback && opt_callback(err);
                }
            });
        });
};

User.hasCredentials = function () {
    if (config.github_token && config.github_user) {
        return true;
    }

    return false;
};

User.login = function (opt_callback) {
    if (User.hasCredentials()) {
        User.authorize();
        opt_callback && opt_callback();
    }
    else {
        User.createAuthorization(opt_callback);
    }
};

User.logout = function () {
    configs.removeGlobalConfig('github_user');
    configs.removeGlobalConfig('github_token');
};

User.twoFactorAuthenticator_ = function (payload, user, opt_callback) {
    inquirer.prompt(
        [
            {
                type: 'input',
                message: 'Enter your two-factor code',
                name: 'otp'
            }
        ], function (factor) {
            if (!payload.headers) {
                payload.headers = [];
            }

            payload.headers['X-GitHub-OTP'] = factor.otp;

            base.github.authorization.create(payload, function (err, res) {
                User.authorizationCallback_(user, err, res);
                opt_callback && opt_callback(err);
            });
        });
};

exports.Impl = User;
