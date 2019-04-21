/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as stripAnsi from 'strip-ansi'
import { runCmd } from './runCmd'

describe('E2E: Pull Request Module Test', () => {
    it('List PRs `gh pr`', done => {
        // strip ansi characters so it doesn't fail on Travis
        expect(stripAnsi(runCmd('gh pr'))).toMatchSnapshot()
        done()
    })

    it('List PRs & sorty by complexity `gh pr --list --sort complexity`', done => {
        // strip ansi characters so it doesn't fail on Travis
        expect(stripAnsi(runCmd('gh pr --list --sort complexity'))).toMatchSnapshot()
        done()
    })

    it('List Detailed PRs `gh pr --detailed`', done => {
        // strip ansi characters so it doesn't fail on Travis
        expect(stripAnsi(runCmd('gh pr  --detailed'))).toMatchSnapshot()
        done()
    })

    it('Fetch PR `gh pr 55`', done => {
        expect(runCmd('gh pr 55')).toMatchSnapshot()
        done()
    })

    it('Fetch & Rebase PR `gh pr 55 --fetch --rebase`', done => {
        expect(runCmd('gh pr 55 --fetch --rebase')).toMatchSnapshot()
        done()
    })

    it('Fwd PR to another user `gh pr 97 --fwd node-gh-bot`', done => {
        expect(runCmd('gh pr 97 --fwd node-gh-bot')).toMatchSnapshot()
        done()
    })

    it('Get PR Info `gh pr --info 50`', done => {
        expect(runCmd('gh pr --info 50')).toMatchSnapshot()
        done()
    })

    it('Comment on PR `gh pr 50 --comment "Just started reviewing :)"`', done => {
        expect(runCmd('gh pr 50 --comment "Just started reviewing :)"')).toMatchSnapshot()
        done()
    })

    it('Open PR `gh pr 40 --open`', done => {
        expect(runCmd('gh pr 40 --open')).toMatchSnapshot()
        done()
    })

    it('Works with passing in multiple number flags `gh pr --open --number 40 --number 50`', done => {
        expect(runCmd('gh pr --open --number 40 --number 50')).toMatchSnapshot()
        done()
    })

    it('Close PR `gh pr 50 --close`', done => {
        expect(runCmd('gh pr 50 --close')).toMatchSnapshot()
        done()
    })

    it('Submit PR `gh pr -s protoEvangelion -b master -t "pr title" -D "pr description"`', done => {
        expect(
            runCmd('gh pr -s protoEvangelion -b master -t "pr title" -D "pr description"')
        ).toMatchSnapshot()
        done()
    })
})
