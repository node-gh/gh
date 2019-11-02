/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as S from 'sanctuary'
import * as Future from 'fluture'
import * as fs from 'fs'
import * as which from 'which'
import * as $ from 'sanctuary-def'

/* SAFE UTILS */
export const safeWhich = Future.encase(which.sync)
export const safeRealpath = Future.encase(fs.realpathSync)

export function safeImport(
    fileName: string
): Future.FutureInstance<NodeJS.ErrnoException, object | string> {
    let moduleObj = null

    try {
        moduleObj = require(fileName)
    } catch (e) {
        return e.code === 'MODULE_NOT_FOUND' ? Future.of(fileName) : Future.reject(e)
    }

    return Future.of(moduleObj)
}

export const safeReaddir = Future.encaseN<any, string[], string>(fs.readdir)

/* TRANSFORMATIONS */
// Allows you to take a Maybe returning function and make it an Either returning function
export function maybeFnToEither(monadReturningFunction) {
    return function convertMaybe(val) {
        const result = monadReturningFunction(val)

        return S.isJust(result) ? S.Right(result.value) : S.Left(null)
    }
}

/**
 * Concats two strings
 * @return {Future}
 */
export const prepend = (a: string) => (b: string) => {
    const argsAreStrings = typeof a === 'string' && typeof b === 'string'

    return argsAreStrings ? Future.of(a + b) : Future.reject('Both args should be strings')
}

/* TYPE CHECKING UTILS */
export const isObject = S.is($.Object)

/* LOGGING UTILS */
export const l = x => {
    console.log('!!!!!!!', x)
    return x
}

// returns a future
export const lf = x => {
    console.log('-------', x)
    return Future.of(x)
}
