/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './runCmd'

describe('E2E: Issues Module Test', () => {
    it('List Issues Shorthand `issue`', done => {
        expect(runCmd('issue')).toMatchSnapshot()
        done()
    })

    xit(`Assign Issues \`gh is --assign -A ${process.env.GH_USER} --number 1\``, done => {
        expect(runCmd(`gh is --assign -A ${process.env.GH_USER} --number 1`)).toMatchSnapshot()
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

    xit('Close Issue `gh is --close --number 7 --number 10`', done => {
        expect(runCmd(`gh is --close --number 7 --number 10`)).toMatchSnapshot()
        done()
    })

    xit('Open Issue `gh is --open --number 7 --number 10`', done => {
        expect(runCmd(`gh is --open --number 7 --number 10`)).toMatchSnapshot()
        done()
    })

    xit('Search Issues `gh is -s hi`', done => {
        expect(runCmd(`gh is -s 'hi'`)).toMatchSnapshot()
        done()
    })
})
