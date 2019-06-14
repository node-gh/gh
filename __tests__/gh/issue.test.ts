/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './runCmd'

describe('E2E: Issues Module Test', () => {
    it('List Issues Shorthand', done => {
        expect(runCmd('issue')).toMatchSnapshot()
        done()
    })

    it(`Assign Issues`, done => {
        expect(runCmd(`issue:assign 1 ${process.env.GH_USER}`)).toMatchSnapshot()
        done()
    })

    xit('Create a new issue `gh is -N -t "Node GH rocks!" -L bug,question,test`', done => {
        expect(runCmd(`gh is -N -t "Node GH rocks!" -L bug,question,test`)).toMatchSnapshot()
        done()
    })

    xit('Comment on Issues `gh is 1 -c "comment"`', done => {
        expect(runCmd(`gh is 1 -c "comment"`)).toMatchSnapshot()
        done()
    })

    it('Close Issue', done => {
        expect(runCmd(`issue:close 7,10`)).toMatchSnapshot()
        done()
    })

    it('Open Issue', done => {
        expect(runCmd(`issue:open 7,10`)).toMatchSnapshot()
        done()
    })

    xit('Search Issues `gh is -s hi`', done => {
        expect(runCmd(`gh is -s 'hi'`)).toMatchSnapshot()
        done()
    })
})
