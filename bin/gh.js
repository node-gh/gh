#!/usr/bin/env node

/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var async = require('async'),
    base = require('../lib/base'),
    fs = require('fs'),
    git = require('../lib/git'),
    logger = require('../lib/logger'),
    nopt = require('nopt'),
    path = require('path'),
    Help = require('../lib/cmds/help').Impl,
    User = require('../lib/cmds/user').Impl,
    config = base.getConfig(),
    command,
    commandDir,
    commandFiles,
    commandPath,
    cooked,
    iterative,
    operations,
    options,
    parsed,
    plugin,
    remain;

// -- Env ------------------------------------------------------------------------------------------

process.env.GH_PATH = path.join(__dirname, '../');

// -- Init -----------------------------------------------------------------------------------------

operations = [];
parsed = nopt(process.argv);
remain = parsed.argv.remain;
cooked = parsed.argv.cooked;

if (!remain.length ||
    (cooked.indexOf('-h') >= 0) ||
    (cooked.indexOf('--help') >= 0)) {

    new Help().run();
    process.exit(0);
}

commandDir = path.join(__dirname, '..', 'lib', 'cmds');
commandPath = path.join(commandDir, remain[0] + '.js');

// -- Find command ---------------------------------------------------------------------------------

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
    plugin = base.getPlugin(remain[0]);

    if (plugin) {
        command = plugin.Impl;

        // If plugin command exists, register the executed plugin name on
        // process.env.PLUGIN. This may simplify core plugin infrastructure.
        process.env.NODEGH_PLUGIN = remain[0];
    }
}

// -- Utils ----------------------------------------------------------------------------------------

function hasCommandInOptions(commands, options) {
    var found = false;

    if (commands) {
        commands.every(function(c) {
            if (options[c] !== undefined) {
                found = true;
                return false;
            }
            return true;
        });
    }

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

// -- Run command ----------------------------------------------------------------------------------

if (command) {
    options = nopt(
        command.DETAILS.options,
        command.DETAILS.shorthands, process.argv, 2);

    iterative = command.DETAILS.iterative;

    cooked = options.argv.cooked;
    remain = options.argv.remain;

    options.number = options.number || [remain[1]];
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

        base.expandAliases(options);

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
