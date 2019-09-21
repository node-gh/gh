/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
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

export function find(filepath, opt_pattern) {
    return fs.readdirSync(filepath).filter(file => {
        return (opt_pattern || /.*/).test(file)
    })
}

export function getUser() {
    return config.github_user || process.env.GH_USER
}

// Export some config methods to allow plugins to access them
export const getConfig = configs.getConfig
export const writeGlobalConfig = configs.writeGlobalConfig
