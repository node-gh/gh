/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var async = require('async'),
    base = require('./base'),
    configs = require('./configs'),
    fs = require('fs'),
    git = require('./git'),
    logger = require('./logger'),
    nopt = require('nopt'),
    path = require('path'),
    Help = require('./cmds/help').Impl,
    User = require('./cmds/user').Impl,
    config = configs.getConfig();

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

function findCommand(name) {
    var Command,
        commandDir,
        commandFiles,
        commandPath;

    commandDir = path.join(__dirname, 'cmds');
    commandPath = path.join(commandDir, name + '.js');

    if (fs.existsSync(commandPath)) {
        Command = require(commandPath).Impl;
    }
    else {
        commandFiles = base.find(commandDir, /\.js$/i);
        commandFiles.every(function(file) {
            commandPath = path.join(commandDir, file);
            Command = require(commandPath).Impl;

            if (Command.DETAILS.alias === name) {
                return false;
            }

            Command = null;
            return true;
        });
    }

    return Command;
}

function loadCommand(name) {
    var Command = findCommand(name),
        plugin;

    // If command was not found, check if it is registered as a plugin.
    if (!Command) {
        plugin = configs.getPlugin(name);

        if (plugin) {
            Command = plugin.Impl;

            // If plugin command exists, register the executed plugin name on
            // process.env.PLUGIN. This may simplify core plugin infrastructure.
            process.env.NODEGH_PLUGIN = name;
        }
    }

    return Command;
}

exports.run = function () {
    var Command,
        iterative,
        operations = [],
        options,
        parsed = nopt(process.argv),
        remain = parsed.argv.remain,
        cooked = parsed.argv.cooked;

    if (!remain.length ||
        (cooked.indexOf('-h') >= 0) ||
        (cooked.indexOf('--help') >= 0)) {

        new Help().run();
        return;
    }

    Command = loadCommand(remain[0]);

    if (!Command) {
        logger.error('Command not found');
        return;
    }

    options = nopt(
        Command.DETAILS.options,
        Command.DETAILS.shorthands, process.argv, 2);

    iterative = Command.DETAILS.iterative;

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

            invokePayload(options, Command, cooked, remain);

            new Command(options).run();
        });
    });
};
