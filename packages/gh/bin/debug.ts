#!/usr/bin/env node

/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

const verbose = process.argv.indexOf('--verbose') !== -1
const insane = process.argv.indexOf('--insane') !== -1

process.on('unhandledRejection', r => console.log(r))

if (verbose || insane) {
    process.env.GH_VERBOSE = 'true'
}

if (insane) {
    process.env.GH_VERBOSE_INSANE = 'true'
}

require('@oclif/command')
    .run()
    .then(require('@oclif/command/flush'))
    .catch(require('@oclif/errors/handle'))
