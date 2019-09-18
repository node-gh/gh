/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './testUtils'

describe('E2E: Alias Module Test', () => {
    it('User alias is expanded `gh user --user=zeno`', done => {
        expect(runCmd('gh user --user=zeno')).toMatchSnapshot()
        done()
    })
})
