/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as opn from 'opn'
import { default as Browser, default as List } from '../../src/commands/issue'
import Assign from '../../src/commands/issue/assign'
import Close from '../../src/commands/issue/close'
import Open from '../../src/commands/issue/open'
import { prepareTestFixtures } from '../../src/utils'
import { runCmd } from '../runCmd'

let spy

beforeEach(() => {
    spy = jest.spyOn(global.console, 'log')
})

afterEach(() => {
    spy.mockRestore()
})

describe('E2E: Issues Module Test', () => {
    it('List Issues Shorthand', async () => {
        const { nockDone } = await prepareTestFixtures('issue.list')

        await List.run([])

        expect(spy.mock.calls).toMatchSnapshot()

        nockDone()
    })

    it('Assign Issues', async () => {
        const { nockDone } = await prepareTestFixtures('issue.assign')

        await Assign.run(['1', process.env.GH_USER])

        expect(spy.mock.calls).toMatchSnapshot()

        nockDone()
    })

    it('Open Issue in Browser', async () => {
        await Browser.run(['7,10'])

        expect(opn).toHaveBeenCalledTimes(2)
        expect(opn).toHaveBeenCalledWith('https://github.com/protoEvangelion/gh/issues/7', {
            wait: false,
        })
    })

    xit('Create a new issue `gh is -N -t "Node GH rocks!" -L bug,question,test`', done => {
        expect(runCmd('gh is -N -t "Node GH rocks!" -L bug,question,test')).toMatchSnapshot()
        done()
    })

    xit('Comment on Issues `gh is 1 -c "comment"`', done => {
        expect(runCmd('gh is 1 -c "comment"')).toMatchSnapshot()
        done()
    })

    it('Close Issue', async () => {
        const { nockDone } = await prepareTestFixtures('issue.close')

        await Close.run(['7,10'])

        expect(spy.mock.calls).toMatchSnapshot()

        nockDone()
    })

    it('Open Issue', async () => {
        const { nockDone } = await prepareTestFixtures('issue.open')

        await Open.run(['7,10'])

        expect(spy.mock.calls).toMatchSnapshot()

        nockDone()
    })

    xit('Search Issues `gh is -s hi`', done => {
        expect(runCmd("gh is -s 'hi'")).toMatchSnapshot()
        done()
    })
})
