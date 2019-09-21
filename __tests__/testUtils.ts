/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { execSync } from 'child_process'

export function runCmd(cmd: string, env?: boolean) {
    try {
        const customEnv = env ? { env: { ...process.env } } : {}

        var result = execSync(cmd, { cwd: process.cwd(), ...customEnv })
    } catch (error) {
        throw new Error(error.output.toString())
    }

    return result.toString()
}
