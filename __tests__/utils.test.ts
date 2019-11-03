/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { fileContents } from '../__mocks__/data'
import { openFileInEditor } from '../src/utils'

jest.mock('fs')
jest.mock('child_process')

describe('Unit test for utils module', () => {
    it('openFileInEditor fn returns expected msg from editor', () => {
        const msg = openFileInEditor(
            'temp-gh-issue-title.txt',
            '# Add a pr title msg on the next line'
        )

        expect(fileContents).toContain(msg)
    })
})
