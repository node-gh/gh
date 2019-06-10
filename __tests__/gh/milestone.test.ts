/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './runCmd'

describe('E2E: Milestone Module Test', () => {
    it('List Milestones `gh ms --list`', done => {
        expect(runCmd('gh ms --list')).toMatchSnapshot()
        done()
    })
})
