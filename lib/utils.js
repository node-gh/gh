"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const nock = require("nock");
const nockBack = nock.back;
function prepareTestFixtures(cmdName, argv) {
    let id = 0;
    // These should only include the flags that you need for e2e tests
    const cmds = [
        {
            name: 'Issue',
            flags: ['--comment', '--new', '--open', '--close', '--search', '--assign'],
        },
        {
            name: 'PullRequest',
            flags: ['--info', '--fetch', '--comment', '--open', '--close', '--submit'],
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
            flags: ['--list', '--new', '--fork', '--delete'],
        },
        {
            name: 'User',
            flags: ['--logout', '--whoami'],
        },
        {
            name: 'Version',
            flags: ['--version'],
        },
    ].filter(cmd => filterByCmdName(cmd, cmdName));
    const newCmdName = formatCmdName(cmds[0], argv);
    nockBack.fixtures = `${process.cwd()}/__tests__/nockFixtures`;
    nockBack.setMode('record');
    const nockPromise = nockBack(`${newCmdName}.json`, {
        before,
        afterRecord,
    });
    return () => nockPromise.then(({ nockDone }) => nockDone()).catch(err => {
        throw new Error(`Nock ==> ${err}`);
    });
    /* --- Normalization Functions --- */
    function normalize(value, key) {
        if (!value)
            return value;
        if (lodash_1.isPlainObject(value)) {
            return lodash_1.mapValues(value, normalize);
        }
        if (lodash_1.isArray(value) && lodash_1.isPlainObject(value[0])) {
            return lodash_1.map(value, normalize);
        }
        if (key.includes('_at')) {
            return '2017-10-10T16:00:00Z';
        }
        if (key.includes('_count')) {
            return 42;
        }
        if (key.includes('id')) {
            return 1000 + id++;
        }
        if (key.includes('node_id')) {
            return 'MDA6RW50aXR5MQ==';
        }
        if (key.includes('url')) {
            return value.replace(/[1-9][0-9]{2,10}/, '000000001');
        }
        return value;
    }
    function afterRecord(fixtures) {
        const normalizedFixtures = fixtures.map(fixture => {
            delete fixture.rawHeaders;
            fixture.path = stripAccessToken(fixture.path);
            if (lodash_1.isArray(fixture.response)) {
                fixture.response = fixture.response.slice(0, 3).map(res => {
                    return lodash_1.mapValues(res, normalize);
                });
            }
            else {
                fixture.response = lodash_1.mapValues(fixture.response, normalize);
            }
            return fixture;
        });
        return normalizedFixtures;
    }
    function stripAccessToken(path) {
        return path.replace(/access_token(.*?)(&|$)/, '');
    }
    function before(scope) {
        scope.filteringPath = () => stripAccessToken(scope.path);
    }
}
exports.prepareTestFixtures = prepareTestFixtures;
function filterByCmdName(cmd, cmdName) {
    return cmd.name === cmdName;
}
function formatCmdName(cmd, argv) {
    if (argv.length === 1) {
        return cmd.name;
    }
    return cmd.flags.reduce((flagName, current) => {
        if (flagName) {
            return flagName;
        }
        if (argv.includes(current)) {
            return concatUpper(cmd.name, current.slice(2));
        }
    }, null);
}
function concatUpper(one, two) {
    return `${one}${lodash_1.upperFirst(two)}`;
}
