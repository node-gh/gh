const { files, fileContents } = require('./data')

const fs = jest.genMockFromModule('fs')

fs.readFile = (_, done) => {
    done(null, 'Readme.md file text')
}

fs.readdir = (_, done) => {
    done(null, files)
}

fs.realpathSync = path => {
    return path
}

fs.writeFileSync = () => {}

fs.readFileSync = () => fileContents

fs.unlinkSync = () => {}

module.exports = fs
