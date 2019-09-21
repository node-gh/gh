/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from './testUtils'

describe('E2E: Issues Module Test', () => {
    it('List Issues `gh is`', done => {
        expect(runCmd('gh is')).toMatchSnapshot()
        done()
    })

    it(`Assign Issues \`gh is --assign -A ${process.env.GH_USER} --number 1\``, done => {
        expect(runCmd(`gh is --assign -A ${process.env.GH_USER} --number 1`)).toMatchSnapshot()
        done()
    })

    it('Open issue in browser `gh is 55 --browser`', done => {
        expect(runCmd('gh is 55 --browser')).toMatchSnapshot()
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

    it('Close Issue `gh is --close --number 7 --number 10`', done => {
        expect(runCmd(`gh is --close --number 7 --number 10`)).toMatchSnapshot()
        done()
    })

    it('Open Issue `gh is --open --number 7 --number 10`', done => {
        expect(runCmd(`gh is --open --number 7 --number 10`)).toMatchSnapshot()
        done()
    })

    it('Search Issues `gh is -s hi`', done => {
        expect(runCmd(`gh is -s 'hi'`)).toMatchSnapshot()
        done()
    })
})
