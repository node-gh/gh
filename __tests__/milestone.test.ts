/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './testUtils'

describe('E2E: Milestone Module Test', () => {
    it('List Milestones `gh ms --list`', done => {
        expect(runCmd('bin/gh.js ms --list')).toMatchSnapshot()
        done()
    })
})
