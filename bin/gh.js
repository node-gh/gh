#!/usr/bin/env node

/*
 * Copyright 2013 Eduardo Lundgren, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

// -- Requires -----------------------------------------------------------------
var async = require('async'),
    base = require('../lib/base'),
    fs = require('fs'),
    git = require('../lib/git'),
    logger = require('../lib/logger'),
    nopt = require('nopt'),
    path = require('path'),
    Help = require('../lib/cmds/help').Impl,
    User = require('../lib/cmds/user').Impl,
    command,
    commandDir,
    commandFiles,
    commandPath,
    config,
    cooked,
    operations,
    options,
    parsed,
    remain;

// -- Init ---------------------------------------------------------------------
config = base.getGlobalConfig();
operations = [];
parsed = nopt(process.argv);
remain = parsed.argv.remain;

if (!remain.length) {
    new Help().run();
    process.exit(0);
}

commandDir = path.join(__dirname, '..', 'lib', 'cmds');
commandPath = path.join(commandDir, remain[0] + '.js');

// -- Find command -------------------------------------------------------------
if (fs.existsSync(commandPath)) {
    command = require(commandPath).Impl;
}
else {
    commandFiles = base.find(commandDir, /\.js$/i);
    commandFiles.every(function(file) {
        commandPath = path.join(commandDir, file);
        command = require(commandPath).Impl;

        if (command.DETAILS.alias === remain[0]) {
            return false;
        }

        command = null;
        return true;
    });
}

// -- Utils --------------------------------------------------------------------
function expandAlias(options) {
    if (config.alias) {
        options.user = config.alias[options.user] || options.user;
        options.fwd = config.alias[options.fwd] || options.fwd;
        options.submit = config.alias[options.submit] || options.submit;
    }
}

function invokePayload(options, command, cooked, remain) {
    var payload;

    if ((remain.length === cooked.length) && command.DETAILS.payload) {
        payload = cooked.concat();
        payload.shift();
        command.DETAILS.payload(payload, options);
    }
}

function normalizeUser(options, paramUser, remoteUser, loggedUser) {
    options.paramUser = paramUser;
    options.remoteUser = remoteUser;
    options.loggedUser = loggedUser;

    if (options.all) {
        options.user = options.paramUser || options.loggedUser;
    }
    else {
        options.user = options.paramUser || options.remoteUser;
    }
}

// -- Run command --------------------------------------------------------------
if (command) {
    options = nopt(
        command.DETAILS.options,
        command.DETAILS.shorthands, process.argv, 2);

    cooked = options.argv.cooked;
    remain = options.argv.remain;

    options.number = options.number || parseInt(remain[1], 10);
    options.remote = options.remote || config.default_remote;

    operations.push(function(callback) {
        git.getUser(options.remote, callback);
    });

    operations.push(function(callback) {
        git.getRepo(options.remote, callback);
    });

    operations.push(git.getCurrentBranch);
    operations.push(base.checkVersion);
    operations.push(User.login);

    async.series(operations, function(err, results) {
        options.repo = options.repo || results[1];
        options.currentBranch = options.currentBranch || results[2];

        normalizeUser(options, options.user, results[0], base.getUser());

        expandAlias(options);

        invokePayload(options, command, cooked, remain);

        new command(options).run();
    });
}
else {
    logger.error('Command not found');
}