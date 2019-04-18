/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: CONTRIBUTORS)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { readFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { runCmd } from './testUtils'

describe('E2E: User Module Test', () => {
    it('List Current User `gh user`', done => {
        expect(runCmd('gh user')).toMatchSnapshot()
        done()
    })

    it('Generates token end to end without 2fa', done => {
        process.env.GENERATE_NEW_TOKEN = 'true'

        // when first generating this you need to add real GitHub
        // user & password credentials that doesn't 2fa enabled
        const user = 'myuser'
        const pass = 'mypass'

        expect(runCmd(`printf "${user}\n${pass}" | gh user --login`, true)).toMatchSnapshot()

        const configPath = join(__dirname, 'auth.json')
        const config = JSON.parse(readFileSync(configPath).toString())

        expect(config.github_token).toBe('234lkj23l4kj234lkj234lkj234lkj23l4kj234l')
        expect(config.github_user).toBe(user)

        unlinkSync(configPath)

        done()
    })

    it('Logout Current User `gh user --logout`', done => {
        expect(runCmd('gh user --logout')).toMatchSnapshot()
        done()
    })

    it('Show just the current username `gh user --whoami`', done => {
        expect(runCmd('gh user --whoami')).toMatchSnapshot()
        done()
    })
})
