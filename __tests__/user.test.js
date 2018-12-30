/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict'

const { runCmd } = require('./testUtils')

describe('E2E: User Module Test', () => {
    it('List Current User `gh user`', done => {
        expect(runCmd('bin/gh.js user')).toMatchSnapshot()
        done()
    })

    it('Logout Current User `gh user --logout`', done => {
        expect(runCmd('bin/gh.js user --logout')).toMatchSnapshot()
        done()
    })

    it('Show just the current username `gh user --whoami`', done => {
        expect(runCmd('bin/gh.js user --whoami')).toMatchSnapshot()
        done()
    })
})
