/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { isCmdAlias } from '../src/cmd'
import * as S from 'sanctuary'

jest.mock('fs')

describe('Unit test for cmd module', () => {
    it('isCmdAlias returns whether or not command name is a valid alias', done => {
        isCmdAlias('gi').value(isAlias => {
            expect(isAlias.value).toBe('gists.ts')

            done()
        })

        isCmdAlias('åå').value(isAlias => {
            expect(S.isNothing(isAlias)).toBe(true)

            done()
        })
    })
})
