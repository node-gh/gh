/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { files } from '../__mocks__/data'
import { find } from '../src/base'

jest.mock('fs')

describe('Unit test for cmd module', () => {
    beforeEach(() => {
        // Set up some mocked out file info before each test
        require('fs')
    })

    it('Checks which files match a pattern in a directory', done => {
        find('dirPath').value(dirs => {
            expect(dirs).toEqual(files)
            done()
        })

        find('dirPath', new RegExp(`${files[1]}$`, 'i')).value(dirs => {
            expect(dirs).toEqual([files[1]])
            done()
        })
    })
})
