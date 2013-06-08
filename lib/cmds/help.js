/*
 * Copyright 2013, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

// -- Requires -----------------------------------------------------------------
var base = require('../base'),
    logger = require('../logger'),
    path = require('path');

// -- Constructor --------------------------------------------------------------
function Help() {}

// -- Constants ----------------------------------------------------------------
Help.DETAILS = {
    description: 'List all commands and options available.'
};

// -- Commands -----------------------------------------------------------------
Help.prototype.run = function() {
    var instance = this;

    var cmdDir = path.join(__dirname, '../cmds/'),
        cmdList = base.find(cmdDir, /\.js$/),
        cmdOutput = [];

    // Remove help from command list
    cmdList.splice(cmdList.indexOf('help.js'), 1);

    for (var i = 0; i < cmdList.length; i++) {
        var cmd = require(path.join(cmdDir, cmdList[i]));

        cmdOutput[i] = {
            alias: cmd.Impl.DETAILS.alias,
            description: cmd.Impl.DETAILS.description,
            flags: instance.groupOptions_(cmd.Impl.DETAILS),
            name: path.basename(cmdList[i], '.js')
        };
    }

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

        shorthands.forEach(function(shorthand, index) {
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