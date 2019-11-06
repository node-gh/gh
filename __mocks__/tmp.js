const tmp = jest.genMockFromModule('tmp')

tmp.fileSync = cmdName => {
    return { name: 'tmp-is-title.md', removeCallback: () => {} }
}

module.exports = tmp
