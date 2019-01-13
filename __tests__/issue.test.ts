/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './runCmd'

describe('E2E: Issues Module Test', () => {
    it('List Issues `gh is`', done => {
        expect(runCmd('gh is')).toMatchSnapshot()
        done()
    })

    it(`Assign Issues \`gh is --assign -A ${process.env.GH_USER} --number 1\``, done => {
        expect(runCmd(`gh is --assign -A ${process.env.GH_USER} --number 1`)).toMatchSnapshot()
        done()
    })

    it('Create a new issue `gh is -N -t "Node GH rocks!" -L bug,question,test`', done => {
        expect(runCmd(`gh is -N -t "Node GH rocks!" -L bug,question,test`)).toMatchSnapshot()
        done()
    })

    it('Comment on Issues `gh is 1 -c "comment"`', done => {
        expect(runCmd(`gh is 1 -c "comment"`)).toMatchSnapshot()
        done()
    })

    it('Open Issue `gh is 1 -o`', done => {
        expect(runCmd(`gh is 1 -o`)).toMatchSnapshot()
        done()
    })

    it('Close Issue `gh is 1 -C`', done => {
        expect(runCmd(`gh is 1 -C`)).toMatchSnapshot()
        done()
    })

    it('Search Issues `gh is -s hi`', done => {
        expect(runCmd(`gh is -s 'hi'`)).toMatchSnapshot()
        done()
    })
})
