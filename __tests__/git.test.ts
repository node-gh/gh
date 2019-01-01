/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

// -- Requires -------------------------------------------------------------------------------------

import * as assert from 'assert'
import * as git from '../lib/git'

// -- Suites ---------------------------------------------------------------------------------------

describe('Git Module Tests', () => {
    describe('Function parseRemoteUrl', () => {
        describe('ssh clone url', () => {
            it('should parse remote url with score on repo name', () => {
                var p = git.parseRemoteUrl('git@github.com:eduardolundgren/node-gh.git')

                assert.equal('eduardolundgren', p[0])
                assert.equal('node-gh', p[1])
            })

            it('should parse remote url with score on username', () => {
                var p = git.parseRemoteUrl('git@github.com:elixir-lang/elixir.git')

                assert.equal('elixir-lang', p[0])
                assert.equal('elixir', p[1])
            })
        })

        describe('https clone url', () => {
            it('should parse remote url with score on repo name', () => {
                var p = git.parseRemoteUrl('https://github.com/eduardolundgren/node-gh.git')

                assert.equal('eduardolundgren', p[0])
                assert.equal('node-gh', p[1])
            })

            it('should parse remote url with score on username', () => {
                var p = git.parseRemoteUrl('https://github.com/elixir-lang/elixir.git')

                assert.equal('elixir-lang', p[0])
                assert.equal('elixir', p[1])
            })
        })
    })
})
