import { execSync } from 'child_process'

export function runCmd(cmd) {
    try {
        var result = execSync(cmd, { cwd: process.cwd() })
    } catch (error) {
        throw new Error(error.output.toString())
    }

    return result.toString()
}
