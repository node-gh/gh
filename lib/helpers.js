getCurrentDirName = function() {
    const cwdArr = process
        .cwd()
        .toString()
        .split('/')
    const dirName = cwdArr[cwdArr.length - 1]
    return dirName
}
module.exports = getCurrentDirName
