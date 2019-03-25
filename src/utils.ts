export function getCurrentFolderName(): string {
    const cwdArr = process
        .cwd()
        .toString()
        .split('/')

    return cwdArr[cwdArr.length - 1]
}
