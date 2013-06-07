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
    help = require('../lib/cmds/help').Impl.prototype,
    logger = require('../lib/logger'),
    nopt = require('nopt'),
    path = require('path'),
    command,
    commandDir,
    commandFiles,
    commandPath,
    config,
    cooked,
    operations,
    options,
    parsed,
    payload,
    remain;

// -- Init ---------------------------------------------------------------------
config = base.getGlobalConfig();
operations = [];
parsed = nopt(process.argv);
remain = parsed.argv.remain;

if (!remain.length) {
    help.run();
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

// -- Run command --------------------------------------------------------------
if (command) {
    options = nopt(
        command.DETAILS.options,
        command.DETAILS.shorthands, process.argv, 2);

    cooked = options.argv.cooked;
    remain = options.argv.remain;

    options.number = options.number || parseInt(remain[1], 10);
    options.remote = options.remote || config.default_remote;

    operations.push(base.login);
    operations.push(base.checkVersion);
    operations.push(git.getCurrentBranch);
    operations.push(function(callback) {
        git.getUser(options.remote, callback);
    });
    operations.push(function(callback) {
        git.getRepo(options.remote, callback);
    });

    async.series(operations, function(err, results) {
        options.currentBranch = options.currentBranch || results[2];
        options.repo = options.repo || results[4];

        if (options.all) {
            options.user = options.user || base.getUser();
        }
        else {
            options.user = options.user || results[3];
        }

        if ((remain.length === cooked.length) && command.DETAILS.payload) {
            payload = options.argv.cooked.concat();
            payload.shift();
            command.DETAILS.payload(payload, options);
        }

        new command(options).run();
    });
}
else {
    logger.error('Command not found');
}