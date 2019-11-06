/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { get } from './index'

export async function infoHandler(options) {
    try {
        await get(options, options.user, options.repo, options.number)
    } catch (err) {
        throw new Error(`Can't get pull requests.\n${err}`)
    }
}
