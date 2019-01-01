/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as base from '../base'
import * as logger from '../logger'

export default function Version() {}

Version.DETAILS = {
    alias: 'v',
    description: 'Print gh version.',
}

Version.prototype.run = function() {
    base.asyncReadPackages(this.printVersion)
}

Version.prototype.printVersion = function(pkg) {
    logger.log(`${pkg.name} ${pkg.version}`)
}
