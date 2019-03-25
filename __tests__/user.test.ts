/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './runCmd'

describe('E2E: User Module Test', () => {
    it('List Current User `gh user`', done => {
        expect(runCmd('gh user')).toMatchSnapshot()
        done()
    })

    it('Logout Current User `gh user --logout`', done => {
        expect(runCmd('gh user --logout')).toMatchSnapshot()
        done()
    })

    it('Show just the current username `gh user --whoami`', done => {
        expect(runCmd('gh user --whoami')).toMatchSnapshot()
        done()
    })
})
