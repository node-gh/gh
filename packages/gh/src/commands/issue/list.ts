import { flags } from '@oclif/command'
import { isArray } from 'lodash'
import Command from '../../base'
import { github } from '../../github'
import { afterHooks, beforeHooks } from '../../hooks'
import * as logger from '../../logger'
import { getUserRepo } from '../../utils'

export const listCmdFlags = {
    all: flags.boolean({ char: 'a', description: 'List all issues' }),
    assignee: flags.string({
        char: 'A',
        description: 'Filter issues by assignee(case sensitive) login id',
    }),
    detailed: flags.boolean({ char: 'd', description: 'Show detailed version of issues' }),
    label: flags.string({
        char: 'L',
        description: 'Filter issues by label(s). If multiple labels they should be comma separated',
    }),
    milestone: flags.string({
        char: 'M',
        description: 'Filter issues by milestone (case insensitive)',
    }),
    state: flags.string({
        required: false,
        default: 'open',
        description: 'Filter issues by state',
        options: ['open', 'closed'],
    }),
}

export default class List extends Command {
    static aliases = ['i:l', 'issue:l', 'issue:list']

    public static description = 'List & filter issues'

    public static flags = {
        ...Command.flags,
        ...listCmdFlags,
    }

    public async run() {
        runListCmd(this.flags).catch(err => logger.error(err, 'Error listing issues.'))
    }
}

export async function runListCmd(flags) {
    beforeHooks('issue.list', flags)

    if (flags.all) {
        logger.log(
            `Listing ${logger.colors.green(flags.state)} issues for ${logger.colors.green(
                flags.user
            )}`
        )

        await listFromAllRepositories(flags.user)
    } else {
        logger.log(`Listing ${logger.colors.green(flags.state)} issues on ${getUserRepo(flags)}`)

        await list(flags)
    }

    afterHooks('issue.list', flags)
}

async function list(flags, repo?: string) {
    let payload

    payload = {
        repo: repo || flags.repo,
        owner: flags.user,
        state: flags.state,
    }

    if (flags.labels) {
        payload.labels = flags.labels
    }

    if (flags['no-milestone']) {
        payload.milestone = 'none'
    }

    if (flags.milestone) {
        const data = await github('issues.listMilestonesForRepo', {
            repo: flags.repo,
            owner: flags.user,
        })

        const milestoneNumber = data.filter(byMilestoneTitle).map(getNumber)

        payload.milestone = `${milestoneNumber}`
    }

    function byMilestoneTitle(milestone) {
        return flags.milestone === milestone.title
    }

    function getNumber(milestone) {
        return milestone.number
    }

    if (flags.assignee) {
        payload.assignee = flags.assignee
    }

    const data = await github('issues.listForRepo', payload)

    const issues = data.filter(result => Boolean(result))

    if (issues && issues.length > 0) {
        const formattedIssues = formatIssues(issues, flags.detailed)

        flags.all
            ? logger.log(`\n${getUserRepo(this)}:\n${formattedIssues}`)
            : logger.log(formattedIssues)
    } else {
        logger.log(`\nNo issues on ${getUserRepo(flags)}`)
    }
}

async function listFromAllRepositories(user) {
    const payload = {
        type: 'all',
        username: user,
    }

    const repositories: any = await github('repos.listForUser', payload)

    for (const repo of repositories) {
        await list(repo.owner.login, repo.name)
    }
}

function formatIssues(issues, showDetailed, dateFormatter?: string) {
    issues.sort((a, b) => {
        return a.number > b.number ? -1 : 1
    })

    if (issues && issues.length > 0) {
        const formattedIssuesArr = issues.map(issue => {
            const issueNumber = logger.colors.green(`#${issue.number}`)
            const issueUser = logger.colors.magenta(`@${issue.user.login}`)
            const issueDate = `(${logger.getDuration(issue.created_at, dateFormatter)})`

            let formattedIssue = `${issueNumber} ${issue.title} ${issueUser} ${issueDate}`

            if (showDetailed) {
                if (issue.body) {
                    formattedIssue = `
                        ${formattedIssue}
                        ${issue.body}
                    `
                }

                if (isArray(issue.labels) && issue.labels.length > 0) {
                    const labels = issue.labels.map(label => label.name)
                    const labelHeading = labels.length > 1 ? 'labels: ' : 'label: '

                    formattedIssue = `
                        ${formattedIssue}
                        ${logger.colors.yellow(labelHeading) + labels.join(', ')}
                    `
                }

                if (issue.milestone) {
                    const { number, title } = issue.milestone

                    formattedIssue = `
                        ${formattedIssue}
                        ${`${logger.colors.green('milestone: ')} ${title} - ${number}`}
                    `
                }

                formattedIssue = `
                    ${formattedIssue}
                    ${logger.colors.blue(issue.html_url)}
                `
            }

            return trim(formattedIssue)
        })

        return formattedIssuesArr.join('\n\n')
    }

    return null
}

function trim(str) {
    return str
        .replace(/^[ ]+/gm, '')
        .replace(/[\r\n]+/g, '\n')
        .trim()
}
