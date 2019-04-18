import { execSync } from 'child_process'

export function runCmd(cmd, env?) {
    try {
        if (env) {
            env = { env: { ...process.env } }
        }
        var result = execSync(cmd, { cwd: process.cwd(), ...(env && env) })
    } catch (error) {
        throw new Error(error.output.toString())
    }

    return result.toString()
}
