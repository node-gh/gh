/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as stripAnsi from 'strip-ansi'
import { runCmd } from './testUtils'

describe('E2E: Gist Module Test', () => {
    it('List Gists `gh gi`', done => {
        expect(runCmd('gh gi')).toMatchSnapshot()
        done()
    })

    it('Open gist in browser `gh gi --browser --id 5444883`', done => {
        expect(runCmd('gh gi --browser --id 5444883')).toMatchSnapshot()
        done()
    })

    it('Create new gist `gh gi --new hello --content "Hello World!"`', done => {
        expect(runCmd('gh gi --new hello --content "Hello World!"')).toMatchSnapshot()
        done()
    })

    it('Fork a gist `gh gi --fork 5444883`', done => {
        expect(runCmd('gh gi --fork 5444883')).toMatchSnapshot()
        done()
    })

    it('Delete gists `gh gi --delete 5250d21093b46bd0665c2e8656d16bd2 --delete 30e5d3c69a6997617ab69d07b733105e`', done => {
        expect(
            stripAnsi(
                runCmd(
                    'echo "y\n" | gh gi --delete 5250d21093b46bd0665c2e8656d16bd2 --delete 30e5d3c69a6997617ab69d07b733105e'
                )
            )
        ).toMatchSnapshot()
        done()
    })
})
