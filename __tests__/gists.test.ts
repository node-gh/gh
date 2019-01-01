/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './testUtils'

describe('E2E: Gist Module Test', () => {
    it('List Gists `gh gi`', done => {
        expect(runCmd('gh gi')).toMatchSnapshot()
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

    it('Delete gists `gh gi --delete 027b64c22a5e8d1bf16bc2cfede77e43 --delete 1ad5b3b35fe6906e8980c0fd7522e2d6`', done => {
        expect(
            runCmd(
                'gh gi --delete 027b64c22a5e8d1bf16bc2cfede77e43 --delete 1ad5b3b35fe6906e8980c0fd7522e2d6'
            )
        ).toMatchSnapshot()
        done()
    })
})
