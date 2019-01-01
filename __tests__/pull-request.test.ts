/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './testUtils'

describe('E2E: Pull Request Module Test', () => {
    it('List PRs `gh pr`', done => {
        expect(runCmd('bin/gh.js pr')).toMatchSnapshot()
        done()
    })

    it('Get PR Info `gh pr --info 50`', done => {
        expect(runCmd('bin/gh.js pr --info 50')).toMatchSnapshot()
        done()
    })

    it('Comment on PR `gh pr 50 --comment "Just started reviewing :)"`', done => {
        expect(runCmd('bin/gh.js pr 50 --comment "Just started reviewing :)"')).toMatchSnapshot()
        done()
    })

    it('Open PR `gh pr 50 --open`', done => {
        expect(runCmd('bin/gh.js pr 50 --open')).toMatchSnapshot()
        done()
    })

    it('Close PR `gh pr 50 --close`', done => {
        expect(runCmd('bin/gh.js pr 50 --close')).toMatchSnapshot()
        done()
    })

    it('Submit PR `gh pr -s protoEvangelion -b master -t "pr title" -D "pr description"`', done => {
        expect(
            runCmd('bin/gh.js pr -s protoEvangelion -b master -t "pr title" -D "pr description"')
        ).toMatchSnapshot()
        done()
    })
})
