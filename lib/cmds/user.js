"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
// -- Requires -------------------------------------------------------------------------------------
const fs = require("fs");
const inquirer = require("inquirer");
const moment = require("moment");
const userhome = require("userhome");
const base = require("../base");
const configs = require("../configs");
const logger = require("../logger");
const config = configs.getConfig();
const testing = process.env.NODE_ENV === 'testing';
// -- Constructor ----------------------------------------------------------------------------------
function User(options) {
    this.options = options;
}
exports.default = User;
// -- Constants ------------------------------------------------------------------------------------
User.DETAILS = {
    alias: 'us',
    description: 'Provides the ability to login and logout if needed.',
    commands: ['login', 'logout', 'whoami'],
    options: {
        login: Boolean,
        logout: Boolean,
        whoami: Boolean,
    },
    shorthands: {
        l: ['--login'],
        L: ['--logout'],
        w: ['--whoami'],
    },
    payload(payload, options) {
        options.login = true;
    },
};
// -- Commands -------------------------------------------------------------------------------------
User.prototype.run = function () {
    const instance = this;
    const options = instance.options;
    if (options.login) {
        if (User.hasCredentials()) {
            logger.log(`You're logged in as ${logger.colors.green(options.user)}`);
        }
    }
    if (options.logout) {
        logger.log(`Logging out of user ${logger.colors.green(options.user)}`);
        !testing && User.logout();
    }
    if (options.whoami) {
        logger.log(options.user);
    }
};
// -- Static ---------------------------------------------------------------------------------------
User.authorize = function () {
    base.github.authenticate({
        type: 'oauth',
        token: getCorrectToken(configs.getConfig()),
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
    logger.log("First we need authorization to use GitHub's API. Login with your GitHub account.");
    inquirer
        .prompt([
        {
            type: 'input',
            message: 'Enter your GitHub user',
            name: 'user',
        },
        {
            type: 'password',
            message: 'Enter your GitHub password',
            name: 'password',
        },
    ])
        .then(answers => {
        var payload = {
            note: `Node GH (${moment().format('MMMM Do YYYY, h:mm:ss a')})`,
            note_url: 'https://github.com/eduardolundgren/node-gh',
            scopes: ['user', 'public_repo', 'repo', 'repo:status', 'delete_repo', 'gist'],
        };
        base.github.authenticate({
            type: 'basic',
            username: answers.user,
            password: answers.password,
        });
        base.github.authorization.create(payload, (err, res) => {
            const isTwoFactorAuthentication = err && err.message && err.message.indexOf('OTP') > 0;
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
    if ((config.github_token && config.github_user) ||
        (process.env.GH_TOKEN && process.env.GH_USER)) {
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
    inquirer
        .prompt([
        {
            type: 'input',
            message: 'Enter your two-factor code',
            name: 'otp',
        },
    ])
        .then(factor => {
        if (!payload.headers) {
            payload.headers = [];
        }
        payload.headers['X-GitHub-OTP'] = factor.otp;
        base.github.authorization.create(payload, (err, res) => {
            User.authorizationCallback_(user, err, res);
            opt_callback && opt_callback(err);
        });
    });
};
function getCorrectToken(config) {
    if (process.env.CONTINUOUS_INTEGRATION) {
        return process.env.GH_TOKEN;
    }
    if (process.env.NODE_ENV === 'testing') {
        // Load your local token when generating test fixtures
        return JSON.parse(fs.readFileSync(userhome('.gh.json')).toString()).github_token;
    }
    return config.github_token;
}
