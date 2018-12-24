/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

'use strict'

const rewire = require('rewire')
const assert = require('assert')
const pullRequestsUnstable = require('./fixture/pull-request-unstable.json')
const pullRequestsInfo = require('./fixture/pull-request-info.json')
const { runCmd } = require('./testUtils')

describe('E2E: Pull Request Module Test', () => {
    it('List PRs `gh pr`', done => {
        expect(runCmd('bin/gh.js pr')).toMatchSnapshot()
        done()
    })

    it('Get PR Info `gh pr --info 50`', done => {
        expect(runCmd('bin/gh.js pr --info 50')).toMatchSnapshot()
        done()
    })

    it('Fetch PR `gh pr --fetch 50`', done => {
        expect(runCmd('bin/gh.js pr --fetch 50')).toMatchSnapshot()
        done()
    })

    it('Comment on PR `gh pr 50 --comment "Just started reviewing :)"`', done => {
        expect(runCmd('bin/gh.js pr 50 --comment "Just started reviewing :)"')).toMatchSnapshot()
        done()
    })
})

describe('Pull Requests Module Tests', function() {
    const pullRequest = rewire('../lib/cmds/pull-request')

    it('should fail to get pull request', function() {
        var pr = new pullRequest.Impl({
            repo: 'senna.js',
        })

        pullRequest.__with__({
            'logger.log': function() {
                assert.fail('Expected test to fail.')
            },
            'logger.warn': function() {},
            base: {
                github: {
                    pullRequests: {
                        get: function(payload, callback) {
                            callback(new Error('Should fail to get pull request.'), undefined)
                        },
                    },
                },
            },
        })(function() {
            pr.get('liferay', 'senna.js', '36')
        })
    })

    it('should get pull request with mergeable state clean', function() {
        var cleanLogFound = false,
            pr = new pullRequest.Impl({
                repo: 'senna.js',
            })

        pr.options.info = true

        pullRequest.__with__({
            'logger.log': function() {
                // only evaluate that the clean has a green log message
                if (arguments[0].indexOf('clean') > 1) {
                    cleanLogFound = true

                    assert.strictEqual(arguments[0], 'Mergeable (clean)')
                }
            },
            'logger.warn': function() {
                assert.fail('Expected test to pass.')
            },
            base: {
                github: {
                    pullRequests: {
                        get: function(payload, callback) {
                            callback(undefined, pullRequestsInfo)
                        },
                    },
                },
            },
        })(function() {
            pr.get('liferay', 'senna.js', '36')
        })

        if (cleanLogFound === false) {
            assert.fail('Clean log was not found.')
        }
    })

    it('should get pull request with mergeable state unstable', function() {
        var pr = new pullRequest.Impl({
            repo: 'senna.js',
        })

        pr.options.info = true

        pullRequest.__with__({
            'logger.log': function() {},
            'logger.warn': function() {
                assert.strictEqual(arguments[0], 'Not mergeable (unstable)')
            },
            base: {
                github: {
                    pullRequests: {
                        get: function(payload, callback) {
                            callback(undefined, pullRequestsUnstable)
                        },
                    },
                },
            },
        })(function() {
            pr.get('liferay', 'senna.js', '78')
        })
    })

    it('should only get the issue number from a properly prefixed branch', function() {
        var pr = new pullRequest.Impl({ repo: 'senna.js' })

        assert.equal(pr.getPullRequestNumberFromBranch_('pr-12345', 'pr-'), '12345')
        assert.equal(pr.getPullRequestNumberFromBranch_('abcpr-12345', 'pr-'), undefined)
    })
})
