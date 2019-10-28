/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as S from 'sanctuary'
import * as Future from 'fluture'
import * as fs from 'fs'

// Allows you to take a Maybe returning function and make it an Either returning function
export function maybeFnToEither(monadReturningFunction) {
    return function convertMaybe(val) {
        const result = monadReturningFunction(val)

        return S.isJust(result) ? S.Right(result.value) : S.Left(null)
    }
}

export const importFuture = Future.encase(require)
export const readdirFuture = Future.encaseN<NodeJS.ErrnoException, string[], string>(fs.readdir)

export const l = x => {
    console.log('!!!!!!!', x)
    return x
}
