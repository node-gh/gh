/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as stripAnsi from 'strip-ansi'
import { runCmd } from './testUtils'

describe('E2E: Pull Request Module Test', () => {
    it('List PRs `gh pr`', done => {
        // strip ansi characters so it doesn't fail on Travis
        expect(stripAnsi(runCmd('gh pr'))).toMatchSnapshot()
        done()
    })

    it('List Detailed PRs `gh pr --detailed`', done => {
        // strip ansi characters so it doesn't fail on Travis
        expect(stripAnsi(runCmd('gh pr --detailed'))).toMatchSnapshot()
        done()
    })

    it('List Detailed PRs `gh pr --detailed --prettyPrint`', done => {
        // strip ansi characters so it doesn't fail on Travis
        expect(stripAnsi(runCmd('gh pr --detailed --prettyPrint'))).toMatchSnapshot()
        done()
    })

    it('Open pr in browser `gh pr 55 --browser`', done => {
        expect(runCmd('gh pr 55 --browser')).toMatchSnapshot()
        done()
    })

    /* These have been passing locally but failing in Travis, need to find out work around */
    xit('List PRs `gh pr --list --prettyPrint`', done => {
        // strip ansi characters so it doesn't fail on Travis
        expect(stripAnsi(runCmd('gh pr --list --prettyPrint'))).toMatchSnapshot()
        done()
    })

    xit('List PRs & sorty by complexity `gh pr --list --sort complexity`', done => {
        // strip ansi characters so it doesn't fail on Travis
        expect(stripAnsi(runCmd('gh pr --list --sort complexity'))).toMatchSnapshot()
        done()
    })

    xit('Fetch PR `gh pr 55`', done => {
        expect(runCmd('gh pr 55')).toMatchSnapshot()
        done()
    })
    /* --------------- */

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

    it('Close PR `gh pr --close --number 50 --number 40`', done => {
        expect(runCmd('gh pr --close --number 50 --number 40')).toMatchSnapshot()
        done()
    })

    it('Open PR `gh pr --open --number 50 --number 40`', done => {
        expect(runCmd('gh pr --open --number 50 --number 40')).toMatchSnapshot()
        done()
    })

    it('Submit PR `gh pr -s protoEvangelion -b master -t "pr title" -D "pr description"`', done => {
        expect(
            runCmd('gh pr -s protoEvangelion -b master -t "pr title" -D "pr description"')
        ).toMatchSnapshot()
        done()
    })

    it('Submit PR as a draft `gh pr -s protoEvangelion -b master -t "pr title" --draft`', done => {
        expect(runCmd('gh pr -s protoEvangelion -b master -t "pr title" --draft')).toMatchSnapshot()
        done()
    })
})
