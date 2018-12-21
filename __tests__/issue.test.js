/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

const { runCmd } = require('./testUtils')

describe('E2E: Issues Module Test', () => {
    it('List Issues `gh is`', done => {
        expect(runCmd('bin/gh.js is')).toMatchSnapshot()
        done()
    })

    it('Comment on Issuess `gh is 1 -c "test"`', done => {
        expect(runCmd(`bin/gh.js is 1 -c "test"`)).toMatchSnapshot()
        done()
    })
})
