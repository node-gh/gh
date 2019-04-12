/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as fs from 'fs'
import * as configs from './configs'

// -- Config -------------------------------------------------------------------

const config = configs.getConfig()

export function clone(o) {
    return JSON.parse(JSON.stringify(o))
}

// -- Utils --------------------------------------------------------------------

export function load() {}

export function expandAliases(options) {
    if (config.alias) {
        options.fwd = config.alias[options.fwd] || options.fwd
        options.submit = config.alias[options.submit] || options.submit
        options.user = config.alias[options.user] || options.user
    }
}

export function find(filepath, opt_pattern) {
    return fs.readdirSync(filepath).filter(file => {
        return (opt_pattern || /.*/).test(file)
    })
}

export function getUser() {
    return config.github_user
}

// Export some config methods to allow plugins to access them
export const getConfig = configs.getConfig
export const writeGlobalConfig = configs.writeGlobalConfig

function setupGithubClient(config) {
    const baseUrl =
        config.github_host === 'https://github.com' ? 'https://api.github.com' : config.github_host

    const github = new Github({
        baseUrl,
    })

    // function paginate(method) {
    //     return function paginatedMethod(payload, cb) {
    //         let results = [] as any

    //         const getSubsequentPages = (link, pagesCb) => {
    //             if (github.hasNextPage(link)) {
    //                 github.getNextPage(link, (err, res: IPaginate) => {
    //                     if (err) {
    //                         return pagesCb(err)
    //                     }
    //                     results = res
    //                     return getSubsequentPages(res.meta.link, pagesCb)
    //                 })
    //             }
    //             pagesCb()
    //         }

    //         method(payload, (err, res: IPaginate) => {
    //             if (err) {
    //                 return cb(err, null)
    //             }

    //             if (!Array.isArray(res)) {
    //                 return cb(err, res)
    //             }

    //             results = res

    //             getSubsequentPages(res.meta.link, err => {
    //                 cb(err, results)
    //             })
    //         })
    //     }
    // }

    // for (let key in github.repos) {
    //     if (typeof github.repos[key] === 'function') {
    //         github.repos[key] = paginate(github.repos[key])
    //     }
    // }

    return github
}
