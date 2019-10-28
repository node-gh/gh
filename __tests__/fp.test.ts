/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { files } from '../__mocks__/data'
import { readdirFuture, importFuture } from '../src/fp'

jest.mock('fs')

describe('Unit test for fp module', () => {
    it('readdirFuture fn returns expected files', done => {
        readdirFuture('dirPath').value(dirs => {
            expect(dirs).toEqual(files)
            done()
        })
    })

    it('importFuture fn returns expected file or error', done => {
        importFuture('../src/fp').value(({ importFuture }) => {
            expect(typeof importFuture).toBe('function')
            done()
        })

        importFuture('idontexist').fork(
            ({ message }) => {
                expect(message).toBe(`Cannot find module 'idontexist' from 'fp.ts'`)
                done()
            },
            () => {}
        )
    })
})
