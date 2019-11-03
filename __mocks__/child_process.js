const childProcess = jest.genMockFromModule('child_process')

childProcess.execSync = () => {}

childProcess.spawnSync = () => {
    return {
        stdout: {
            toString() {
                return ''
            },
        },
        stderr: {
            toString() {
                return ''
            },
        },
        status: 'OK',
    }
}

module.exports = childProcess
