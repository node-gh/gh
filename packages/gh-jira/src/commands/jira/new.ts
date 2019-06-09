import { Command, flags } from '@oclif/command'

export default class New extends Command {
    static description = 'describe the command here'

    static examples = [
        `$ oclif-example New
    New world from ./src/New.ts!
`,
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
        // flag with a value (-n, --name=VALUE)
        name: flags.string({ char: 'n', description: 'name to print' }),
        // flag with no value (-f, --force)
        force: flags.boolean({ char: 'f' }),
    }

    static args = [{ name: 'file' }]

    async run() {
        const { args, flags } = this.parse(New)

        const name = flags.name || 'world'
        this.log(`New ${name} from ./src/commands/New.ts`)
        if (args.file && flags.force) {
            this.log(`you input --force and --file: ${args.file}`)
        }
    }
}
