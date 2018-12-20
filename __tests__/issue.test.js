/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

const { execSync } = require('child_process')

describe('E2E: Issues Module Test', () => {
    it('List Issues `gh is`', done => {
        const result = execSync('bin/gh.js is', { cwd: process.cwd() })

        expect(result.toString()).toMatchSnapshot()

        done()
    })
})
