/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { isCmdAlias, loadCommand, isCmdHelpOrVersion } from '../src/cmd'
import * as S from 'sanctuary'

jest.mock('fs')

describe('isCmdAlias function', () => {
    it('Shows gi as a valid alias for the gists cmd', done => {
        isCmdAlias('gi').value(isAlias => {
            expect(isAlias.value).toBe('gists.ts')

            done()
        })
    })

    it('Shows nothing for bogus alias', done => {
        isCmdAlias('åå').value(isAlias => {
            expect(S.isNothing(isAlias)).toBe(true)

            done()
        })
    })
})

describe('isCmdHelpOrVersion function', () => {
    it('finds version cmd', () => {
        expect(
            isCmdHelpOrVersion({
                cooked: ['--version'],
                remain: ['version'],
            }).value
        ).toBe('version')

        expect(
            isCmdHelpOrVersion({
                cooked: ['-v'],
                remain: [],
            }).value
        ).toBe('version')
    })

    it('finds help cmd', () => {
        expect(
            isCmdHelpOrVersion({
                cooked: ['--help'],
                remain: ['help'],
            }).value
        ).toBe('help')
    })

    it('returns nothing for pr cmd', () => {
        expect(
            S.isNothing(
                isCmdHelpOrVersion({
                    cooked: ['pr'],
                    remain: ['pr'],
                })
            )
        ).toBe(true)
    })
})

describe('loadCommand function', () => {
    it('finds hello cmd', done => {
        loadCommand('pr', {
            cooked: ['pr'],
            remain: ['pr'],
        }).value(({ name }) => {
            expect(name).toBe('PullRequest')

            done()
        })
    })

    it('finds the version cmd', done => {
        loadCommand('version', {
            cooked: ['--version'],
            remain: [],
        }).value(file => {
            expect(file.name).toBe('Version')

            done()
        })
    })

    it('finds the help cmd', done => {
        loadCommand('help', {
            cooked: ['--help'],
            remain: ['help'],
        }).value(file => {
            expect(file.name).toBe('Help')

            done()
        })
    })
})
