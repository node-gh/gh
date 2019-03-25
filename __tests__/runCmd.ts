/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { execSync } from 'child_process'

export function runCmd(cmd) {
    try {
        var result = execSync(cmd, { cwd: process.cwd(), encoding: 'utf8' })
    } catch (error) {
        throw new Error(error.output.toString())
    }

    return result
}
