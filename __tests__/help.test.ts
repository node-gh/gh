/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { runCmd } from '../src/test-utils'

describe('E2E: Help Module Test', () => {
    it('`gh --help`', done => {
        // Need to remove plugins because some people may have diff plugins on diff systems
        const cmdOutput = runCmd('gh --help')
            .split('\n')
            .filter(function removePluginLines(line) {
                return !line.includes('plugin')
            })

        expect(cmdOutput.join('\n')).toMatchSnapshot()
        done()
    })
})
