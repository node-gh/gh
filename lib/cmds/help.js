/*
 * Copyright 2013-2015, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/node-gh/gh/blob/master/LICENSE.md
 *
 * @author Zeno Rocha <zno.rocha@gmail.com>
 * @author Eduardo Lundgren <edu@rdo.io>
 */

'use strict';

// -- Requires -------------------------------------------------------------------------------------

var base = require('../base'),
    configs = require('../configs'),
    logger = require('../logger'),
    nopt = require('nopt'),
    path = require('path'),
    stream = require('stream'),
    url = require('url');

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

Help.prototype.run = function () {
    var instance = this,
        commands = [],
        cmdDir = path.join(__dirname, '../cmds/'),
        files = base.find(cmdDir, /\.js$/),
        filter,
        options = this.options,
        plugins;

    // Remove help from command list
    files.splice(files.indexOf('help.js'), 1);
    files.splice(files.indexOf('version.js'), 1);

    // Get external plugins
    plugins = configs.getPlugins();

    plugins.forEach(function (plugin) {
        try {
            files.push(configs.getPluginPath(plugin));
        }
        catch (e) {
            logger.warn('Can\'t get ' + plugin + ' plugin path.');
        }
    });

    filter = options.argv.remain[0];

    if (filter === 'help') {
        filter = options.argv.remain[1];
    }

    files.forEach(function (dir) {
        var cmd = require(path.resolve(cmdDir, dir)),
            alias = cmd.Impl.DETAILS.alias || '',
            flags = [],
            name = path.basename(dir, '.js').replace(/^gh-/, ''),
            offset = 20 - alias.length - name.length;

        if (offset < 1) {
            offset = 1;
        }

        if (offset !== 1 && alias.length === 0) {
            offset += 2;
        }

        if (filter && (filter !== alias) && (filter !== name)) {
            return;
        }

        if (filter || options.all) {
            flags = instance.groupOptions_(cmd.Impl.DETAILS);
            offset = 1;
        }

        commands.push({
            alias: alias,
            description: cmd.Impl.DETAILS.description,
            flags: flags,
            name: name,
            offset: new Array(offset + 1).join(' ')
        });
    });

    if (filter && commands.length === 0) {
        logger.error('No manual entry for ' + filter);
        return;
    }

    logger.log(this.listCommands_(commands));
};

Help.prototype.listFlags_ = function (command) {
    var flags = command.flags,
        content = '';

    flags.forEach(function (flag) {
        content += '    ';

        if (flag.shorthand) {
            content += '-' + flag.shorthand + ', ';
        }

        content += '--' + flag.option;

        if (flag.cmd) {
            content += '*';
        }

        if (flag.type) {
            content += logger.colors.cyan(' (' + flag.type + ')');
        }

        content += '\n';
    });

    if (flags.length !== 0) {
        content += '\n';
    }

    return content;
};

Help.prototype.listCommands_ = function (commands) {
    var content = 'usage: gh <command> [payload] [--flags] [--verbose] [--no-hooks]\n\n',
        pos,
        command;

    content += 'List of available commands:\n';

    for (pos in commands) {
        if (commands.hasOwnProperty(pos)) {
            command = commands[pos];
            content += '  ';

            if (command.alias) {
                content += logger.colors.magenta(command.alias) + ', ';
            }

            content += logger.colors.magenta(command.name) + command.offset + command.description + '\n';

            content += this.listFlags_(command);
        }
    }

    content += '\n(*) Flags that can execute an action.\n' +
    '\'gh help\' lists available commands.\n' +
    '\'git help -a\' lists all available subcommands.';

    return content;
};

Help.prototype.groupOptions_ = function (details) {
    var instance = this,
        cmd,
        options,
        shorthands,
        grouped = [];

    options = Object.keys(details.options);
    shorthands = Object.keys(details.shorthands);

    options.forEach(function (option) {
        var foundShorthand,
            type;

        shorthands.forEach(function (shorthand) {
            var shorthandValue = details.shorthands[shorthand][0];

            if (shorthandValue === '--' + option) {
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

Help.prototype.getType_ = function (type) {
    var types,
        separator = ', ';

    if (Array.isArray(type)) {
        types = type;

        // Iterative options have an Array reference as the last type
        // e.g. [String, Array], [Boolean, Number, Array], [.., Array]
        if (type[type.length - 1] === Array) {
            type.pop();
        }

        type = '';

        types.forEach(function (eachType) {
            type += this.getType_(eachType) + separator;
        }, this);

        type = type.substr(0, type.length - separator.length);

        return type;
    }

    switch (type) {
        case String:
            type = 'String';
            break;
        case url:
            type = 'Url';
            break;
        case Number:
            type = 'Number';
            break;
        case path:
            type = 'Path';
            break;
        case stream.Stream:
            type = 'Stream';
            break;
        case Date:
            type = 'Date';
            break;
        case Boolean:
            type = 'Boolean';
            break;
    }

    return type;
};

Help.prototype.isCommand_ = function (details, option) {
    if (details.commands && (details.commands.indexOf(option) > -1)) {
        return true;
    }

    return false;
};

exports.Impl = Help;
