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
    path = require('path'),
    which = require('which');

// -- Constructor --------------------------------------------------------------
function Help() {}

// -- Constants ----------------------------------------------------------------
Help.DETAILS = {
    description: 'List all commands and options available.'
};

// -- Commands -----------------------------------------------------------------
Help.prototype.run = function() {
    var instance = this,
        cmdDir = path.join(__dirname, '../cmds/'),
        cmdList = base.find(cmdDir, /\.js$/),
        cmdOutput = [],
        nodeModulesPath = path.join(process.execPath, '/../../lib/node_modules'),
        plugins;

    // Remove help from command list
    cmdList.splice(cmdList.indexOf('help.js'), 1);

    // Get external plugins
    plugins = fs.readdirSync(nodeModulesPath).filter(function(plugin) {
        return plugin.substring(0, 3) === 'gh-';
    });

    plugins.forEach(function(cmd) {
        try {
            cmdList.push(which.sync(cmd));
        }
        catch(e) {
        }
    });

    cmdList.forEach(function(dir) {
        var cmd = require(path.resolve(cmdDir, dir));

        cmdOutput.push({
            alias: cmd.Impl.DETAILS.alias,
            description: cmd.Impl.DETAILS.description,
            flags: instance.groupOptions_(cmd.Impl.DETAILS),
            name: path.basename(dir, '.js').replace(/^gh-/, '')
        });
    });

    logger.logTemplateFile('help.handlebars', {
        commands: cmdOutput
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
                return;
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
    }

    return type;
};

exports.Impl = Help;