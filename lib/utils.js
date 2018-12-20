exports.setUpNock = function(cmdName) {
    if (process.env.NODE_ENV === 'testing') {
        const nockBack = require('nock').back
        const { isPlainObject, mapValues } = require('lodash')

        nockBack.setMode('record')
        nockBack.fixtures = `${process.cwd()}/__tests__/nockFixtures`

        let id = 0

        function normalize(value, key) {
            if (isPlainObject(value)) {
                return mapValues(value, normalize)
            }

            if (key.includes('node_id')) {
                return 'MDA6RW50aXR5MQ=='
            }

            if (key.includes('id')) {
                return 1000 + id++
            }

            if (key.includes('_at')) {
                return '2017-10-10T16:00:00Z'
            }

            if (key.includes('_count')) {
                return 42
            }

            return value
        }

        function afterRecord(fixtures) {
            const normalizedFixtures = fixtures.map(fixture => {
                fixture.path = stripAccessToken(fixture.path)
                fixture.response = fixture.response.slice(0, 3)

                delete fixture.rawHeaders

                fixture.response = fixture.response.map(res => {
                    return mapValues(res, normalize)
                })

                return fixture
            })

            return normalizedFixtures
        }

        function stripAccessToken(path) {
            return path.replace(
                /access_token.*/,
                'access_token=0000000000000000000000000000000000000001'
            )
        }

        function before(scope) {
            scope.filteringPath = stripAccessToken
        }

        return nockBack(`${cmdName}.json`, {
            before,
            afterRecord,
        })
    }
}
