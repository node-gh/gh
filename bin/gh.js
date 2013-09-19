#!/usr/bin/env node

/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
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
    which = require('which'),
    Help = require('../lib/cmds/help').Impl,
    User = require('../lib/cmds/user').Impl,
    command,
    commandDir,
    commandFiles,
    commandPath,
    config,
    cooked,
    iterative,
    operations,
    options,
    parsed,
    remain;

// -- Env ----------------------------------------------------------------------
process.env.GH_PATH = path.join(__dirname, '../');

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

// If command was not found, check if it is registered as a plugin.
if (!command) {
    try {
        command = require(which.sync('gh-' + remain[0])).Impl;
    }
    catch(e) {
    }
}

// -- Utils --------------------------------------------------------------------
function expandAlias(options) {
    if (config.alias) {
        options.user = config.alias[options.user] || options.user;
        options.fwd = config.alias[options.fwd] || options.fwd;
        options.submit = config.alias[options.submit] || options.submit;
    }
}

function hasCommandInOptions(commands, options) {
    var found = false;

    commands.every(function(c) {
        if (options.hasOwnProperty(c)) {
            found = true;
            return false;
        }
        return true;
    });

    return found;
}

function invokePayload(options, command, cooked, remain) {
    var payload;

    if (command.DETAILS.payload && !hasCommandInOptions(command.DETAILS.commands, options)) {
        payload = remain.concat();
        payload.shift();
        command.DETAILS.payload(payload, options);
    }
}

// -- Run command --------------------------------------------------------------
if (command) {
    options = nopt(
        command.DETAILS.options,
        command.DETAILS.shorthands, process.argv, 2);

    iterative = command.DETAILS.iterative;

    cooked = options.argv.cooked;
    remain = options.argv.remain;

    options.number = options.number || [parseInt(remain[1], 10)];
    options.remote = options.remote || config.default_remote;

    operations.push(User.login);

    operations.push(function(callback) {
        git.getUser(options.remote, callback);
    });

    operations.push(function(callback) {
        git.getRepo(options.remote, callback);
    });

    operations.push(git.getCurrentBranch);
    operations.push(base.checkVersion);

    async.series(operations, function(err, results) {
        var iterativeValues;

        options.loggedUser = base.getUser();
        options.remoteUser = results[1];

        if (!options.user) {
            if (options.repo || options.all) {
                options.user = options.loggedUser;
            }
            else {
                options.user = options.remoteUser || options.loggedUser;
            }
        }

        options.repo = options.repo || results[2];
        options.currentBranch = options.currentBranch || results[3];

        expandAlias(options);

        // Try to retrieve iterative values from iterative option key,
        // e.g. option['number'] === [1,2,3]. If iterative option key is not
        // present, assume [undefined] in order to initialize the loop.
        iterativeValues = options[iterative] || [undefined];

        iterativeValues.forEach(function(value) {
            options = base.clone(options);

            // Value can be undefined when the command doesn't have a iterative
            // option.
            options[iterative] = value;

            invokePayload(options, command, cooked, remain);

            new command(options).run();
        });
    });
}
else {
    logger.error('Command not found');
}