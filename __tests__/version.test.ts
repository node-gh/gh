/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './testUtils'

describe('E2E: Version Module Test', () => {
    it('Check Current version `gh --version`', done => {
        expect(runCmd('bin/gh.js --version')).toEqual(
            expect.stringMatching(/gh [0-9]\.[0-9]+\.[0-9]+/)
        )
        done()
    })
})
