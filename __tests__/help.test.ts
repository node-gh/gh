/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './testUtils'

describe('E2E: Help Module Test', () => {
    it('`gh --help`', done => {
        expect(runCmd('gh --help')).toMatchSnapshot()
        done()
    })
})
