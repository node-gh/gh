// import {} from '../src/commands/issue/index.ts'
import { prepareTestFixtures } from '../src/utils'
// import { execSync } from 'child_process'

// export function runCmd(cmd, env?) {
//     try {
//         if (env) {
//             env = { env: { ...process.env } }
//         }
//         var result = execSync(cmd, { cwd: process.cwd(), ...(env && env) })
//     } catch (error) {
//         throw new Error(error.output.toString())
//     }

//     return result.toString()
// }

export async function runCmd(cmd: string) {
    const { nockDone } = await prepareTestFixtures('issue.list')

    const Cmd = await import('../src/commands/issue/index')

    Cmd.run([])

    nockDone()
}
