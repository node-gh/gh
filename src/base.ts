/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

const configs = require('./configs')

import fs = require('fs')
const Github = require('github')
const path = require('path')
const updateNotifier = require('update-notifier')

// -- Config -------------------------------------------------------------------

exports.clone = function(o) {
    return JSON.parse(JSON.stringify(o))
}

// -- Utils --------------------------------------------------------------------

exports.load = function() {
    exports.github = setupGithubClient(configs.getConfig())
}

exports.asyncReadPackages = function(callback) {
    function async(err, data) {
        if (err) {
            throw err
        }

        callback(JSON.parse(data))
    }

    fs.readFile(path.join(__dirname, '..', 'package.json'), async)

    configs.getPlugins().forEach(plugin => {
        fs.readFile(path.join(configs.getNodeModulesGlobalPath(), plugin, 'package.json'), async)
    })
}

exports.notifyVersion = function(pkg) {
    var notifier = updateNotifier({ pkg })

    if (notifier.update) {
        notifier.notify()
    }
}

exports.checkVersion = function() {
    exports.asyncReadPackages(exports.notifyVersion)
}

exports.expandAliases = function(options) {
    const config = configs.getConfig()

    if (config.alias) {
        options.fwd = config.alias[options.fwd] || options.fwd
        options.submit = config.alias[options.submit] || options.submit
        options.user = config.alias[options.user] || options.user
    }
}

exports.find = function(filepath, opt_pattern) {
    return fs.readdirSync(filepath).filter(file => {
        return (opt_pattern || /.*/).test(file)
    })
}

exports.getUser = function() {
    return configs.getConfig().github_user
}

// Export some config methods to allow plugins to access them
exports.getConfig = configs.getConfig
exports.writeGlobalConfig = configs.writeGlobalConfig

interface IPaginate {
    meta: {
        link: string
    }
}

function setupGithubClient(config) {
    const github = new Github({
        debug: false,
        host: config.api.host,
        protocol: config.api.protocol,
        version: config.api.version,
        pathPrefix: config.api.pathPrefix,
    })

    function paginate(method) {
        return function paginatedMethod(payload, cb) {
            let results = [] as any

            const getSubsequentPages = (link, pagesCb) => {
                if (github.hasNextPage(link)) {
                    github.getNextPage(link, (err, res: IPaginate) => {
                        if (err) {
                            return pagesCb(err)
                        }
                        results = res
                        return getSubsequentPages(res.meta.link, pagesCb)
                    })
                }
                pagesCb()
            }

            method(payload, (err, res: IPaginate) => {
                if (err) {
                    return cb(err, null)
                }

                if (!Array.isArray(res)) {
                    return cb(err, res)
                }

                results = res

                getSubsequentPages(res.meta.link, err => {
                    cb(err, results)
                })
            })
        }
    }

    for (let key in github.repos) {
        if (typeof github.repos[key] === 'function') {
            github.repos[key] = paginate(github.repos[key])
        }
    }

    return github
}
