/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var base = require('../base'),
    logger = require('../logger'),
    nopt = require('nopt'),
    path = require('path');

// -- Constructor ----------------------------------------------------------------------------------

function Help() {
    this.options = nopt(
        Help.DETAILS.options,
        Help.DETAILS.shorthands, process.argv, 2);
}

// -- Constants ------------------------------------------------------------------------------------

Help.DETAILS = {
    description: 'List all commands and options available.',
    options: {
        'all': Boolean,
        'help': Boolean
    },
    shorthands: {
        'a': ['--all'],
        'h': ['--help']
    }
};

// -- Commands -------------------------------------------------------------------------------------

Help.prototype.run = function() {
    var instance = this,
        commands = [],
        cmdDir = path.join(__dirname, '../cmds/'),
        files = base.find(cmdDir, /\.js$/),
        filter,
        options = this.options,
        plugins;

    // Remove help from command list
    files.splice(files.indexOf('help.js'), 1);

    // Get external plugins
    plugins = base.getPlugins();

    plugins.forEach(function(plugin) {
        try {
            files.push(base.getPluginPath(plugin));
        }
        catch (e) {}
    });

    filter = options.argv.remain[0];

    if (filter === 'help') {
        filter = options.argv.remain[1];
    }

    files.forEach(function(dir) {
        var cmd = require(path.resolve(cmdDir, dir)),
            alias = cmd.Impl.DETAILS.alias,
            flags = [],
            name = path.basename(dir, '.js').replace(/^gh-/, '');

        if (filter && (filter !== alias) && (filter !== name)) {
            return;
        }

        if (filter || options.all) {
            flags = instance.groupOptions_(cmd.Impl.DETAILS);
        }

        commands.push({
            alias: alias,
            description: cmd.Impl.DETAILS.description,
            flags: flags,
            name: name
        });
    });

    logger.logTemplateFile('help.handlebars', {
        commands: commands
    });
};

Help.prototype.groupOptions_ = function(details) {
    var instance = this,
        cmd,
        options,
        shorthands,
        grouped = [];

    options = Object.keys(details.options);
    shorthands = Object.keys(details.shorthands);

    options.forEach(function(option) {
        var foundShorthand,
            type;

        shorthands.forEach(function(shorthand) {
            var shorthandValue = details.shorthands[shorthand][0];

            if (shorthandValue.lastIndexOf(option) === 2) {
                foundShorthand = shorthand;
            }
        });

        cmd = instance.isCommand_(details, option);
        type = instance.getType_(details.options[option]);

        grouped.push({
            cmd: cmd,
            option: option,
            shorthand: foundShorthand,
            type: type
        });
    });

    return grouped;
};

Help.prototype.getType_ = function(type) {
    var instance = this;

    // Iterative options should ends with Array class reference in the array of
    // values, e.g. [Type, Array], where the first position is the type of the
    // option and the second position is the Array class reference. In those
    // cases, use the first position to define the type.
    if (Array.isArray(type) && (type[type.length - 1] === Array)) {
        return instance.getType_(type[0]);
    }

    switch (type) {
        case String:
            type = 'String';
            break;
        case require('url'):
            type = 'Url';
            break;
        case Number:
            type = 'Number';
            break;
        case require('path'):
            type = 'Path';
            break;
        case require('stream').Stream:
            type = 'Stream';
            break;
        case Date:
            type = 'Date';
            break;
        case Boolean:
            break;
    }

    return type;
};

Help.prototype.isCommand_ = function(details, option) {
    if (details.commands && (details.commands.indexOf(option) > -1)) {
        return true;
    }

    return false;
};

exports.Impl = Help;
