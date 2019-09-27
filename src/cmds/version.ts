/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { getGlobalPackageJson } from '../configs'
import * as logger from '../logger'

export default function Version() {}

export const name = 'Version'
export const DETAILS = {
    alias: 'v',
    description: 'Print gh version.',
}

export function run() {
    printVersion(getGlobalPackageJson())
}

function printVersion(pkg) {
    logger.log(`${pkg.name} ${pkg.version}`)
}
