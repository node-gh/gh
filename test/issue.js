/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

const { expect } = require('chai')
const fixtures = require('@octokit/fixtures')
const { Impl } = require('../lib/cmds/issue')
const { mockFormattedIssues } = require('./fixture/formatted-issues')

describe('Issues Module Test', () => {
    describe('Search Issues', () => {
        it('formatted issue output should match mock formatted issues', () => {
            const mock = fixtures.mock('api.github.com/search-issues')

            const query = `sesame repo:octokit-fixture-org/search-issues`

            const options = {
                all: false,
                search: query,
                detailed: true,
            }

            Impl.prototype.search(null, null, callback, options, mock)

            function callback(err, formattedIssues) {
                expect(mockFormattedIssues).to.equal(formattedIssues)
            }
        })
    })
})
