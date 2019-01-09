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
const async = require("async");
const fs = require("fs");
const nopt = require("nopt");
const path = require("path");
const base_1 = require("./base");
const user_1 = require("./cmds/user");
const configs = require("./configs");
const git = require("./git");
const config = configs.getConfig();
// -- Utils ----------------------------------------------------------------------------------------
function hasCommandInOptions(commands, options) {
    if (commands) {
        return commands.some(c => {
            return options[c] !== undefined;
        });
    }
    return false;
}
function invokePayload(options, command, cooked, remain) {
    var payload;
    if (command.DETAILS.payload && !hasCommandInOptions(command.DETAILS.commands, options)) {
        payload = remain.concat();
        payload.shift();
        command.DETAILS.payload(payload, options);
    }
}
function resolveCmd(name, commandDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandFiles = base_1.find(commandDir, /\.js$/i);
        const commandName = commandFiles.filter(file => {
            switch (file) {
                case 'milestone.js':
                    if (name === 'ms')
                        return true;
                    break;
                case 'notification.js':
                    if (name === 'nt')
                        return true;
                    break;
                case 'pull-request.js':
                    if (name === 'pr')
                        return true;
                    break;
            }
            if (file.startsWith(name)) {
                return true;
            }
            return false;
        })[0];
        if (commandName) {
            return yield Promise.resolve().then(() => require(path.join(commandDir, commandName)));
        }
        return resolvePlugin(name);
    });
}
function resolvePlugin(name) {
    // If plugin command exists, register the executed plugin name on
    // process.env. This may simplify core plugin infrastructure.
    process.env.NODEGH_PLUGIN = name;
    return { default: configs.getPlugin(name).Impl };
}
function loadCommand(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let Command;
        const commandDir = path.join(__dirname, 'cmds');
        const commandPath = path.join(commandDir, `${name}.js`);
        if (fs.existsSync(commandPath)) {
            Command = yield Promise.resolve().then(() => require(commandPath));
        }
        else {
            Command = yield resolveCmd(name, commandDir);
        }
        return Command.default;
    });
}
function setUp() {
    let Command;
    let iterative;
    let options;
    const operations = [];
    const parsed = nopt(process.argv);
    let remain = parsed.argv.remain;
    let cooked = parsed.argv.cooked;
    operations.push(callback => {
        base_1.checkVersion();
        callback();
    });
    operations.push((callback) => __awaiter(this, void 0, void 0, function* () {
        var module = remain[0];
        if (cooked[0] === '--version' || cooked[0] === '-v') {
            module = 'version';
        }
        else if (!remain.length || cooked.indexOf('-h') >= 0 || cooked.indexOf('--help') >= 0) {
            module = 'help';
        }
        try {
            Command = yield loadCommand(module);
        }
        catch (err) {
            throw new Error(`Cannot find module ${module}\n${err}`);
        }
        options = nopt(Command.DETAILS.options, Command.DETAILS.shorthands, process.argv, 2);
        iterative = Command.DETAILS.iterative;
        cooked = options.argv.cooked;
        remain = options.argv.remain;
        options.number = options.number || [remain[1]];
        options.remote = options.remote || config.default_remote;
        if (module === 'help') {
            callback();
        }
        else {
            user_1.default.login(callback);
        }
    }));
    async.series(operations, () => __awaiter(this, void 0, void 0, function* () {
        let iterativeValues;
        const remoteUrl = git.getRemoteUrl(options.remote);
        options.isTTY = {};
        options.isTTY.in = Boolean(process.stdin.isTTY);
        options.isTTY.out = Boolean(process.stdout.isTTY);
        options.loggedUser = base_1.getUser();
        options.remoteUser = git.getUserFromRemoteUrl(remoteUrl);
        if (!options.user) {
            if (options.repo || options.all) {
                options.user = options.loggedUser;
            }
            else {
                options.user = process.env.GH_USER || options.remoteUser || options.loggedUser;
            }
        }
        options.repo = options.repo || git.getRepoFromRemoteURL(remoteUrl);
        options.currentBranch = options.currentBranch || git.getCurrentBranch();
        base_1.expandAliases(options);
        options.github_host = config.github_host;
        options.github_gist_host = config.github_gist_host;
        // Try to retrieve iterative values from iterative option key,
        // e.g. option['number'] === [1,2,3]. If iterative option key is not
        // present, assume [undefined] in order to initialize the loop.
        iterativeValues = options[iterative] || [undefined];
        iterativeValues.forEach((value) => __awaiter(this, void 0, void 0, function* () {
            options = base_1.clone(options);
            // Value can be undefined when the command doesn't have a iterative
            // option.
            options[iterative] = value;
            invokePayload(options, Command, cooked, remain);
            if (process.env.NODE_ENV === 'testing') {
                const { prepareTestFixtures } = yield Promise.resolve().then(() => require('./utils'));
                yield new Command(options).run(prepareTestFixtures(Command.name, cooked));
            }
            else {
                yield new Command(options).run();
            }
        }));
    }));
}
exports.setUp = setUp;
function run() {
    if (!fs.existsSync(configs.getUserHomePath())) {
        configs.createGlobalConfig();
    }
    base_1.load();
    configs.getConfig();
    // If configs.PLUGINS_PATH_KEY is undefined, try to cache it before proceeding.
    if (configs.getConfig()[configs.PLUGINS_PATH_KEY] === undefined) {
        configs.getNodeModulesGlobalPath();
    }
    try {
        process.env.GH_PATH = path.join(__dirname, '../');
        this.setUp();
    }
    catch (e) {
        console.error(e.stack || e);
    }
}
exports.run = run;
