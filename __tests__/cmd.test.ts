/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
    tryResolvingByAlias,
    loadCommand,
    tryResolvingByHelpOrVersion,
    tryResolvingByPlugin,
} from '../src/cmd'

jest.mock('fs')
jest.mock('which')

describe('tryResolvingByAlias function', () => {
    it('Shows gi as a valid alias for the gists cmd', done => {
        tryResolvingByAlias('gi').value(isAlias => {
            expect(isAlias).toBe('gists.ts')

            done()
        })
    })

    it('Shows nothing for bogus alias', done => {
        tryResolvingByAlias('åå').fork(
            isAlias => {
                expect(isAlias).toBe('åå')

                done()
            },
            () => {}
        )
    })
})

describe('tryResolvingByHelpOrVersion function', () => {
    it('finds version cmd', () => {
        tryResolvingByHelpOrVersion({
            cooked: ['--version'],
            remain: ['version'],
        }).value(cmd => {
            expect(cmd).toBe('version')
        })
    })

    it('finds help cmd', () => {
        tryResolvingByHelpOrVersion({
            cooked: ['--help'],
            remain: ['help'],
        }).value(cmd => {
            expect(cmd).toBe('help')
        })
    })

    it('returns arg on fail', () => {
        tryResolvingByHelpOrVersion({
            cooked: ['pr'],
            remain: ['pr'],
        }).fork(
            cmd => {
                expect(cmd).toBe('pr')
            },
            () => {}
        )
    })
})

describe('tryResolvingByPlugin function', () => {
    it('finds plugin path', () => {
        tryResolvingByPlugin('jira').value(path => {
            expect(path).toMatchInlineSnapshot(`"/Users/you/.npm-global/bin/gh-jira"`)
        })
    })

    it('returns ', () => {
        tryResolvingByPlugin(234).fork(
            path => {
                expect(path).toMatchInlineSnapshot(`"Both args should be strings"`)
            },
            () => {}
        )
    })
})

describe('loadCommand function', () => {
    it.only('finds pr cmd', done => {
        loadCommand({
            cooked: ['pr'],
            remain: ['pr'],
        }).value(({ name }) => {
            expect(name).toBe('PullRequest')

            done()
        })
    })

    it('finds the version cmd', done => {
        loadCommand({
            cooked: ['--version'],
            remain: [],
        }).value(file => {
            expect(file.name).toBe('Version')

            done()
        })
    })

    it('finds the help cmd', done => {
        loadCommand({
            cooked: ['--help'],
            remain: ['help'],
        }).value(file => {
            expect(file.name).toBe('Help')

            done()
        })
    })
})
