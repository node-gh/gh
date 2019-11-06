/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as configs from './configs'
import { safeReaddir } from './fp'
import * as Future from 'fluture'

// -- Config -------------------------------------------------------------------

export function clone(o) {
    return JSON.parse(JSON.stringify(o))
}

// -- Utils --------------------------------------------------------------------

/**
 * Returns files in a folder path that match a given patter
 */
export function find(
    dirPath: string,
    optPattern = /.*/
): Future.FutureInstance<NodeJS.ErrnoException, string[]> {
    return safeReaddir(dirPath).map(dirs => {
        return dirs.filter(file => {
            return optPattern.test(file)
        })
    })
}

export function getUser() {
    return configs.getConfig().github_user || process.env.GH_USER
}

// Export some config methods to allow plugins to access them
export const getConfig = configs.getConfig
export const writeGlobalConfig = configs.writeGlobalConfig
