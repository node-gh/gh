"use strict";
/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Github = require("github");
const path = require("path");
const updateNotifier = require("update-notifier");
const configs = require("./configs");
// -- Config -------------------------------------------------------------------
const config = configs.getConfig();
function clone(o) {
    return JSON.parse(JSON.stringify(o));
}
exports.clone = clone;
// -- Utils --------------------------------------------------------------------
function load() { }
exports.load = load;
exports.github = setupGithubClient(config);
function asyncReadPackages(callback) {
    function read(err, data) {
        if (err) {
            throw err;
        }
        callback(JSON.parse(data));
    }
    fs.readFile(path.join(__dirname, '..', 'package.json'), read);
    configs.getPlugins().forEach(plugin => {
        fs.readFile(path.join(configs.getNodeModulesGlobalPath(), plugin, 'package.json'), read);
    });
}
exports.asyncReadPackages = asyncReadPackages;
function notifyVersion(pkg) {
    var notifier = updateNotifier({ pkg });
    if (notifier.update) {
        notifier.notify();
    }
}
exports.notifyVersion = notifyVersion;
function checkVersion() {
    asyncReadPackages(notifyVersion);
}
exports.checkVersion = checkVersion;
function expandAliases(options) {
    if (config.alias) {
        options.fwd = config.alias[options.fwd] || options.fwd;
        options.submit = config.alias[options.submit] || options.submit;
        options.user = config.alias[options.user] || options.user;
    }
}
exports.expandAliases = expandAliases;
function find(filepath, opt_pattern) {
    return fs.readdirSync(filepath).filter(file => {
        return (opt_pattern || /.*/).test(file);
    });
}
exports.find = find;
function getUser() {
    return config.github_user;
}
exports.getUser = getUser;
// Export some config methods to allow plugins to access them
exports.getConfig = configs.getConfig;
exports.writeGlobalConfig = configs.writeGlobalConfig;
function setupGithubClient(config) {
    const github = new Github({
        debug: false,
        host: config.api.host,
        protocol: config.api.protocol,
        version: config.api.version,
        pathPrefix: config.api.pathPrefix,
    });
    function paginate(method) {
        return function paginatedMethod(payload, cb) {
            let results = [];
            const getSubsequentPages = (link, pagesCb) => {
                if (github.hasNextPage(link)) {
                    github.getNextPage(link, (err, res) => {
                        if (err) {
                            return pagesCb(err);
                        }
                        results = res;
                        return getSubsequentPages(res.meta.link, pagesCb);
                    });
                }
                pagesCb();
            };
            method(payload, (err, res) => {
                if (err) {
                    return cb(err, null);
                }
                if (!Array.isArray(res)) {
                    return cb(err, res);
                }
                results = res;
                getSubsequentPages(res.meta.link, err => {
                    cb(err, results);
                });
            });
        };
    }
    for (let key in github.repos) {
        if (typeof github.repos[key] === 'function') {
            github.repos[key] = paginate(github.repos[key]);
        }
    }
    return github;
}
