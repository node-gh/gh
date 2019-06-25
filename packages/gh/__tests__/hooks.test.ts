/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { getHooksFromPath } from '../src/hooks'

it('List Issues Shorthand', done => {
    const options = {
        hooks: {
            issue: {
                after: ['echo hi again', 'echo bye again'],
                before: ['echo hi', 'echo bye'],
            },
        },
    }

    expect(getHooksFromPath('issue.after', options)).toEqual(['echo hi again', 'echo bye again'])
    done()
})
