/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

// -- Requires -----------------------------------------------------------------
var base = require('../base'),
    fs = require('fs'),
    logger = require('../logger'),
    nopt = require('nopt'),
    path = require('path'),
    which = require('which');

// -- Constructor --------------------------------------------------------------
function Help() {
    this.options = nopt(
        Help.DETAILS.options,
        Help.DETAILS.shorthands, process.argv, 2);
}

// -- Constants ----------------------------------------------------------------
Help.DETAILS = {
    description: 'List all commands and options available.',
    options: {
        'help': Boolean
    },
    shorthands: {
        'h': [ '--help' ]
    }
};

// -- Commands -----------------------------------------------------------------
Help.prototype.run = function() {
    var instance = this,
        commands = [],
        cmdDir = path.join(__dirname, '../cmds/'),
        files = base.find(cmdDir, /\.js$/),
        filter,
        nodePath = path.join(process.execPath, '/../../lib/node_modules'),
        options = this.options,
        plugins;

    // Remove help from command list
    files.splice(files.indexOf('help.js'), 1);

    // Get external plugins
    plugins = fs.readdirSync(nodePath).filter(function(plugin) {
        return plugin.substring(0, 3) === 'gh-';
    });

    plugins.forEach(function(cmd) {
        try {
            files.push(which.sync(cmd));
        }
        catch(e) {
        }
    });

    filter = options.argv.remain[0];

    if (filter === 'help') {
        filter = options.argv.remain[1];
    }

    files.forEach(function(dir) {
        var cmd = require(path.resolve(cmdDir, dir)),
            alias = cmd.Impl.DETAILS.alias,
            name = path.basename(dir, '.js').replace(/^gh-/, '');

        if (filter && (filter !== alias) && (filter !== name)) {
            return;
        }

        commands.push({
            alias: alias,
            description: cmd.Impl.DETAILS.description,
            flags: instance.groupOptions_(cmd.Impl.DETAILS),
            name: name
        });
    });

    logger.logTemplateFile('help.handlebars', {
        commands: commands
    });
};

Help.prototype.groupOptions_ = function(details) {
    var instance = this,
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

        type = instance.getType_(details.options[option]);

        grouped.push({
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
    if (Array.isArray(type) && (type[type.length-1] === Array)) {
        return instance.getType_(type[0]);
    }

    switch(type) {
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

exports.Impl = Help;