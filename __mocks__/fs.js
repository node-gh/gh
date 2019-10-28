const { files } = require('./data')

const fs = jest.genMockFromModule('fs')

fs.readFile = (_, done) => {
    done(null, 'Readme.md file text')
}

fs.readdir = (_, done) => {
    done(null, files)
}

module.exports = fs
