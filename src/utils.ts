/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { isArray, isObject, isPlainObject, map, mapValues, upperFirst } from 'lodash'
import * as nock from 'nock'
import * as zlib from 'zlib'
import * as open from 'opn'

const testing = process.env.NODE_ENV === 'testing'

/**
 * Opens url in browser
 */
export function openUrl(url) {
    testing ? console.log(url) : open(url, { wait: false })
}

export function getCurrentFolderName(): string {
    const cwdArr = process
        .cwd()
        .toString()
        .split('/')

    return cwdArr[cwdArr.length - 1]
}

/**
 * Checks to see if the cli arguments are one of the accepted flags
 */
export function userRanValidFlags(commands, options) {
    if (commands) {
        return commands.some(c => {
            return options[c] !== undefined
        })
    }

    return false
}

const nockBack = nock.back

export function prepareTestFixtures(cmdName, argv) {
    let id = 0

    // These should only include the flags that you need for e2e tests
    const cmds = [
        {
            name: 'Issue',
            flags: ['--comment', '--new', '--open', '--close', '--search', '--assign'],
        },
        {
            name: 'PullRequest',
            flags: [
                '--detailed',
                '--info',
                '--fetch',
                '--fwd',
                '--comment',
                '--open',
                '--close',
                '--submit',
                '--draft',
            ],
        },
        {
            name: 'Gists',
            flags: ['--new', '--fork', '--delete'],
        },
        {
            name: 'Milestone',
            flags: ['--list'],
        },
        {
            name: 'Notifications',
        },
        {
            name: 'Repo',
            flags: ['--label', '--list', '--new', '--fork', '--delete'],
        },
        {
            name: 'User',
            flags: ['--login', '--logout', '--whoami'],
        },
        {
            name: 'Version',
            flags: ['--version'],
        },
    ].filter(cmd => cmd.name === cmdName)

    const newCmdName = formatCmdName(cmds[0], argv)

    if (!newCmdName) {
        return () => {}
    }

    nock.disableNetConnect()
    nockBack.fixtures = `${process.cwd()}/__tests__/nockFixtures`
    nockBack.setMode('record')

    const nockPromise = nockBack(`${newCmdName}.json`, {
        before,
        afterRecord,
    })

    return () =>
        nockPromise
            .then(({ nockDone }) => nockDone())
            .catch(err => {
                throw new Error(`Nock ==> ${err}`)
            })

    /* --- Normalization Functions --- */

    function normalize(value, key) {
        if (!value) return value

        if (isPlainObject(value)) {
            return mapValues(value, normalize)
        }

        if (isArray(value) && isPlainObject(value[0])) {
            return map(value, normalize)
        }

        if (key.includes('token')) {
            return '234lkj23l4kj234lkj234lkj234lkj23l4kj234l'
        }

        if (key.includes('_at')) {
            return '2017-10-10T16:00:00Z'
        }

        if (key.includes('_count')) {
            return 42
        }

        if (key.includes('id')) {
            return 1000 + id++
        }

        if (key.includes('node_id')) {
            return 'MDA6RW50aXR5MQ=='
        }

        if (key.includes('url')) {
            return value.replace(/[1-9][0-9]{2,10}/, '000000001')
        }

        return value
    }

    function decodeBuffer(fixture) {
        const response = isArray(fixture.response) ? fixture.response.join('') : fixture.response

        if (!isObject(response)) {
            try {
                // Decode the hex buffer that nock made
                const decoded = Buffer.from(response, 'hex')
                var unzipped = zlib.gunzipSync(decoded).toString('utf-8')
            } catch (err) {
                throw new Error(`Error decoding nock hex:\n${err}`)
            }
        }

        return JSON.parse(unzipped)
    }

    // This only executes when first recording the request, but not on subsequent requests
    function afterRecord(fixtures) {
        const normalizedFixtures = fixtures.map(fixture => {
            const isGzipped = fixture.rawHeaders.includes('gzip')
            let res = fixture.response

            if (fixture.body.note) {
                fixture.body.note = 'Hello from the inside!'
            }

            fixture.path = stripAccessToken(fixture.path)
            fixture.rawHeaders = fixture.rawHeaders.map(header => stripAccessToken(header))

            if (isGzipped) {
                res = decodeBuffer(fixture)
            }

            if (isArray(res)) {
                res = res.slice(0, 3).map(res => {
                    return mapValues(res, normalize)
                })
            } else {
                res = mapValues(res, normalize)
            }

            if (isGzipped) {
                try {
                    // Re-gzip to keep the octokittens happy
                    const stringified = JSON.stringify(res)
                    var zipped = zlib.gzipSync(stringified)
                } catch (err) {
                    throw new Error(`Error re-gzipping nock ==> ${err}`)
                }
            }

            fixture.response = zipped || res

            return fixture
        })

        return normalizedFixtures
    }

    function stripAccessToken(path) {
        return path.replace(/access_token(.*?)(&|$)/gi, '')
    }

    function before(scope) {
        scope.filteringPath = () => stripAccessToken(scope.path)
        scope.filteringRequestBody = (body, aRecordedBody) => {
            if (body.includes('note')) {
                body = JSON.parse(body)
                body.note = aRecordedBody.note

                return JSON.stringify(body)
            }

            return body
        }
    }
}

function formatCmdName(cmd, argv) {
    if (argv.length === 1) {
        return cmd.name
    }

    return cmd.flags.reduce((flagName, current) => {
        if (argv.includes(current)) {
            return concatUpper(cmd.name, current.slice(2))
        }

        return flagName
    }, null)
}

function concatUpper(one, two) {
    return `${one}${upperFirst(two)}`
}
