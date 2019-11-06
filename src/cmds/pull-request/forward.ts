/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { produce } from 'immer'
import { submit } from './submit'
import { fetch } from './fetch'
import { FETCH_TYPE_SILENT } from './index'

export async function forward(options) {
    try {
        var pull = await fetch(options, FETCH_TYPE_SILENT)
    } catch (err) {
        throw new Error(`Error fetching PR\${err}`)
    }

    options = produce(options, draft => {
        draft.title = pull.title
        draft.description = pull.body
        draft.submittedUser = pull.user.login
    })

    const data = await submit(options, options.fwd)

    return { data, options }
}
