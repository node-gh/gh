const which = jest.genMockFromModule('which')

which.sync = cmdName => {
    if (typeof cmdName !== 'string') {
        throw new Error('Not correct arg type')
    }

    return '/Users/you/.npm-global/bin/gh-jira'
}

module.exports = which
