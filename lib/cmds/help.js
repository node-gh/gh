"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// -- Requires -------------------------------------------------------------------------------------
const nopt = require("nopt");
const path = require("path");
const stream = require("stream");
const url = require("url");
const base = require("../base");
const configs = require("../configs");
const logger = require("../logger");
// -- Constructor ----------------------------------------------------------------------------------
function Help() {
    this.options = nopt(Help.DETAILS.options, Help.DETAILS.shorthands, process.argv, 2);
}
exports.default = Help;
// -- Constants ------------------------------------------------------------------------------------
Help.DETAILS = {
    description: 'List all commands and options available.',
    options: {
        all: Boolean,
        help: Boolean,
    },
    shorthands: {
        a: ['--all'],
        h: ['--help'],
    },
};
// -- Commands -------------------------------------------------------------------------------------
Help.prototype.run = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const instance = this;
        const cmdDir = path.join(__dirname, '../cmds/');
        const files = base.find(cmdDir, /\.js$/);
        let filter;
        const options = this.options;
        let plugins;
        // Remove help from command list
        files.splice(files.indexOf('help.js'), 1);
        files.splice(files.indexOf('version.js'), 1);
        // Get external plugins
        plugins = configs.getPlugins();
        plugins.forEach(plugin => {
            try {
                files.push(configs.getPluginPath(plugin));
            }
            catch (e) {
                logger.warn(`Can't get ${plugin} plugin path.`);
            }
        });
        filter = options.argv.remain[0];
        if (filter === 'help') {
            filter = options.argv.remain[1];
        }
        const commands = yield Promise.all(files.map((dir) => __awaiter(this, void 0, void 0, function* () {
            let cmd = yield Promise.resolve().then(() => require(path.resolve(cmdDir, dir)));
            let flags = [];
            if (cmd.default) {
                cmd = cmd.default;
            }
            else {
                cmd = cmd.Impl;
            }
            const alias = cmd.DETAILS.alias || '';
            const name = path.basename(dir, '.js').replace(/^gh-/, '');
            let offset = 20 - alias.length - name.length;
            if (offset < 1) {
                offset = 1;
            }
            if (offset !== 1 && alias.length === 0) {
                offset += 2;
            }
            if (filter && filter !== alias && filter !== name) {
                return;
            }
            if (filter || options.all) {
                flags = instance.groupOptions_(cmd.DETAILS);
                offset = 1;
            }
            return {
                alias,
                flags,
                name,
                description: cmd.DETAILS.description,
                offset: ' '.repeat(offset + 1),
            };
        })));
        if (filter && commands.length === 0) {
            throw new Error(`No manual entry for ${filter}`);
        }
        logger.log(this.listCommands_(commands));
    });
};
Help.prototype.listFlags_ = function (command) {
    const flags = command.flags;
    let content = '';
    flags.forEach(flag => {
        content += '    ';
        if (flag.shorthand) {
            content += `-${flag.shorthand}, `;
        }
        content += `--${flag.option}`;
        if (flag.cmd) {
            content += '*';
        }
        if (flag.type) {
            content += logger.colors.cyan(` (${flag.type})`);
        }
        content += '\n';
    });
    if (flags.length !== 0) {
        content += '\n';
    }
    return content;
};
Help.prototype.listCommands_ = function (commands) {
    let content = 'usage: gh <command> [payload] [--flags] [--verbose] [--no-color] [--no-hooks]\n\n';
    content += 'List of available commands:\n';
    commands.forEach(command => {
        if (command && command.hasOwnProperty('alias')) {
            content += '  ';
            content += `${logger.colors.magenta(command.alias)}, `;
            content += `${logger.colors.magenta(command.name)}${command.offset}${command.description}\n`;
            content += this.listFlags_(command);
        }
    });
    content += `\n(*) Flags that can execute an action.\n'gh help' lists available commands.\n'gh help -a' lists all available subcommands.`;
    return content;
};
Help.prototype.groupOptions_ = function (details) {
    const instance = this;
    let cmd;
    let options;
    let shorthands;
    let grouped = [];
    options = Object.keys(details.options);
    shorthands = Object.keys(details.shorthands);
    options.forEach(option => {
        let foundShorthand;
        let type;
        shorthands.forEach(shorthand => {
            var shorthandValue = details.shorthands[shorthand][0];
            if (shorthandValue === `--${option}`) {
                foundShorthand = shorthand;
            }
        });
        cmd = instance.isCommand_(details, option);
        type = instance.getType_(details.options[option]);
        grouped.push({
            cmd,
            option,
            type,
            shorthand: foundShorthand,
        });
    });
    return grouped;
};
Help.prototype.getType_ = function (type) {
    let types;
    const separator = ', ';
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
    if (details.commands && details.commands.indexOf(option) > -1) {
        return true;
    }
    return false;
};
