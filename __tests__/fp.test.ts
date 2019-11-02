/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { files } from '../__mocks__/data'
import { safeReaddir, safeImport } from '../src/fp'

jest.mock('fs')

describe('Unit test for fp module', () => {
    it('safeReaddir fn returns expected files', done => {
        safeReaddir('dirPath').value(dirs => {
            expect(dirs).toEqual(files)
            done()
        })
    })

    it('safeImport fn returns expected file or error', done => {
        safeImport('../src/fp').value(({ safeImport }) => {
            expect(typeof safeImport).toBe('function')
            done()
        })

        safeImport('idontexist').fork(
            ({ message }) => {
                expect(message).toBe(`Cannot find module 'idontexist' from 'fp.ts'`)
                done()
            },
            () => {}
        )
    })
})
