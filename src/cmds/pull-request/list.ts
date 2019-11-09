/**
 * © 2013 Liferay, Inc. <https://liferay.com> and Node GH contributors
 * (see file: README.md)
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as Table from 'cli-table3'
import { produce } from 'immer'
import * as ora from 'ora'
import * as marked from 'marked'
import * as TerminalRenderer from 'marked-terminal'
import * as wrap from 'wordwrap'

import * as logger from '../../logger'
import { afterHooks, beforeHooks } from '../../hooks'
import { askUserToPaginate, handlePagination } from '../../utils'
import { printPullInfo, STATUSES, testing, getPullRequest } from './index'

const SORT_COMPLEXITY = 'complexity'
const DIRECTION_DESC = 'desc'
const DIRECTION_ASC = 'asc'
const SORT_CREATED = 'created'

const spinner = ora({ text: 'Fetching PRs', discardStdin: false })

export async function listHandler(options) {
    await beforeHooks('pull-request.list', { options })

    let who

    options = produce(options, draft => {
        draft.sort = draft.sort || SORT_CREATED
        draft.direction = draft.direction || DIRECTION_DESC
    })

    if (options.all) {
        who = options.user

        if (options.org) {
            who = options.org
        }

        logger.log(`Listing all ${options.state} pull requests for ${logger.colors.green(who)}`)

        try {
            await listFromAllRepositories(options)
        } catch (err) {
            throw new Error(`Can't list all pull requests from repos.\n${err}`)
        }
    } else {
        if (options.me) {
            logger.log(
                `Listing ${options.state} pull requests sent by ${logger.colors.green(
                    options.loggedUser
                )} on ${logger.colors.green(`${options.user}/${options.repo}`)}`
            )
        } else {
            logger.log(
                `Listing ${options.state} pull requests on ${logger.colors.green(
                    `${options.user}/${options.repo}`
                )}`
            )
        }

        try {
            await list(options)
        } catch (err) {
            throw new Error(`Can't list pull requests.\n${err}`)
        }
    }

    await afterHooks('pull-request.list', { options })
}

async function list(options, page = 1) {
    spinner.start()

    const { user, repo, all, sort, direction, state, pageSize, GitHub, me, config } = options

    let sortType = sort

    if (sort === SORT_COMPLEXITY) {
        sortType = SORT_CREATED
    }

    const payload = {
        repo,
        sort: sortType,
        owner: user,
        direction: direction,
        state: state,
        page,
        per_page: pageSize,
    }

    const { data, hasNextPage } = await handlePagination({
        options,
        listEndpoint: GitHub.pulls.list,
        payload,
    })

    let pulls = data

    if (me) {
        pulls = filterPullsSentByMe_(options, pulls)
    }

    if (sort && sort === SORT_COMPLEXITY) {
        try {
            pulls = await addComplexityParamToPulls_(options, pulls)
        } catch (err) {
            throw new Error(`Error sorting by complexity\n${err}`)
        }

        pulls = sortPullsByComplexity_(pulls, options.direction)
    }

    pulls = await Promise.all(
        pulls.map(async function mapStatus(pull) {
            const statusPayload = {
                repo,
                owner: user,
                ref: pull.head.sha,
            }

            try {
                var { data } = await options.GitHub.repos.getCombinedStatusForRef(statusPayload)
            } catch (err) {
                throw new Error(`Error getting combined status for ref\n${err}`)
            }

            return { ...pull, combinedStatus: data.state }
        })
    )

    const json = getPullsTemplateJson_(options, pulls)

    const currentUserRepo = logger.colors.yellow(`${user}/${repo}`)

    spinner.stop()

    if (pulls.length) {
        logger.log(currentUserRepo)

        json.branches.forEach((branch, index, arr) => {
            logger.log(`${logger.colors.blue('Branch:')} ${branch.name} (${branch.total})`)

            const printTableView = config.pretty_print === undefined || Boolean(config.pretty_print)

            if (printTableView) {
                printPullsInfoTable_(options, branch.pulls)
            } else {
                branch.pulls.forEach(pull => printPullInfo(options, pull))
            }

            if (index !== arr.length - 1) {
                logger.log('')
            }
        })

        if (all) {
            logger.log('')
        }
    }

    if (hasNextPage) {
        const continuePaginating = await askUserToPaginate(`Pull Requests for ${currentUserRepo}`)

        continuePaginating && (await list({ ...options, user, repo }, page + 1))
    }

    return
}

async function listFromAllRepositories(options) {
    let apiMethod

    const payload: any = {
        type: 'all',
        owner: options.user,
    }

    if (options.org) {
        apiMethod = 'listForOrg'
        payload.org = options.org
    } else {
        apiMethod = 'listForUser'
        payload.username = options.user
    }

    try {
        var repositories = await options.GitHub.paginate(
            options.GitHub.repos[apiMethod].endpoint(payload)
        )
    } catch (err) {
        throw new Error(`Error listing repos`)
    }

    for (const repo of repositories) {
        await list({ ...options, user: repo.owner.login, repo: repo.name })
    }
}

async function addComplexityParamToPulls_(options, pulls) {
    return Promise.all(
        pulls.map(async pull => {
            options = produce(options, draft => {
                draft.number = pull.number
            })

            try {
                var { data } = await getPullRequest(options)
            } catch (err) {
                throw new Error(`Error getting PR\n${err}`)
            }

            const metrics = {
                additions: data.additions,
                changedFiles: data.changed_files,
                comments: data.comments,
                deletions: data.deletions,
                reviewComments: data.review_comments,
            }

            pull.complexity = calculateComplexity_(metrics)

            return pull
        })
    )
}

function calculateComplexity_(metrics): number {
    const weightAddition = 2
    const weightChangedFile = 2
    const weightComment = 2
    const weightDeletion = 2
    const weightReviewComment = 1

    const complexity =
        metrics.additions * weightAddition +
        metrics.changedFiles * weightChangedFile +
        metrics.comments * weightComment +
        metrics.deletions * weightDeletion +
        metrics.reviewComments * weightReviewComment

    return complexity
}

function filterPullsSentByMe_(options, pulls) {
    return pulls.filter(pull => {
        if (options.loggedUser === pull.user.login) {
            return pull
        }
    })
}

function getPullsTemplateJson_(options, pulls) {
    let branch

    const branches = {}
    const json = {
        branches: [],
    }

    pulls.forEach(pull => {
        branch = pull.base.ref

        if (!options.branch || options.branch === branch) {
            branches[branch] = branches[branch] || []
            branches[branch].push(pull)
        }
    })

    Object.keys(branches).forEach(branch => {
        json.branches.push({
            name: branch,
            pulls: branches[branch],
            total: branches[branch].length,
        })
    })

    return json
}

function printPullsInfoTable_(options, pulls) {
    const showDetails = options.info || options.detailed

    logger.log(generateTable())

    function generateTable(): string {
        const isCompact = process.stdout.columns < 100 && !testing

        const tableWidths = getColWidths(isCompact)

        const table = new Table({
            colWidths: tableWidths,
        }) as Table.HorizontalTable

        type TCell = (
            | string
            | {
                  content: string
                  hAlign: Table.HorizontalAlignment
              })[]

        let tableHead: TCell = [
            { content: '#', hAlign: 'center' },
            showDetails ? 'Details' : 'Title',
            'Author',
            'Opened',
            'Status',
        ]

        if (isCompact) {
            tableHead = remove2ndItem(tableHead)
        }

        tableHead = tableHead.map(heading => {
            if (typeof heading === 'string') {
                return logger.colors.red(heading)
            }

            return { content: logger.colors.red(heading.content), hAlign: heading.hAlign }
        })

        table.push(tableHead)

        pulls.forEach(pull => {
            const { createdTime, number, prInfo, user, status } = getColorizedFields(
                pull,
                isCompact ? getTotalWidth() : tableWidths[1],
                options.date
            )

            const body: TCell = [
                { content: number, hAlign: 'center' },
                prInfo,
                user,
                createdTime,
                { content: status, hAlign: 'center' },
            ]

            if (isCompact) {
                table.push(remove2ndItem(body))

                const titleLabel = showDetails ? '' : logger.colors.blue('Title:')

                table.push([{ colSpan: 4, content: `${titleLabel} ${prInfo}\n`.trim() }])
            } else {
                table.push(body)
            }
        })

        return table.toString()
    }

    function getColorizedFields(pull, length, dateFormatter) {
        const createdTime = logger.getDuration(pull.created_at, dateFormatter)
        const number = logger.colors.green(`#${pull.number}`)
        const prInfo = formatPrInfo(pull, length)
        const user = logger.colors.magenta(`@${pull.user.login}`)
        const status = STATUSES[pull.combinedStatus]

        return { createdTime, number, prInfo, user, status }
    }

    function getTotalWidth(): number {
        const padding = 6
        const terminalCols = process.stdout.columns - padding
        return testing ? 100 : terminalCols
    }

    function getColWidths(compact: boolean): number[] {
        const totalWidth = getTotalWidth()
        const dateCol = 15
        const noCol = 9
        const statusCol = 8

        const authorCol = compact ? totalWidth - dateCol - noCol - statusCol : 21
        const titleCol = totalWidth - authorCol - dateCol - noCol - statusCol

        let colWidths = [noCol, titleCol, authorCol, dateCol, statusCol]

        if (compact) {
            colWidths = remove2ndItem(colWidths)
        }

        return colWidths.map(col => Math.floor(col))
    }

    function formatPrInfo(pull, length) {
        const paddedLength = length - 5
        const title = wrap(paddedLength)(pull.title)

        const labels = pull.labels.length > 0 && pull.labels.map(label => label.name).join(', ')
        const singularOrPlural = labels && pull.labels.length > 1 ? 's' : ''
        const formattedLabels = labels
            ? logger.colors.yellow(`\nLabel${singularOrPlural}: ${labels}`)
            : ''

        let info = `${title}${formattedLabels}`

        if (showDetails) {
            marked.setOptions({
                renderer: new TerminalRenderer({
                    reflowText: true,
                    width: paddedLength,
                }),
            })

            info = `
                ${logger.colors.blue('Title:')}

                ${title}

                ${formattedLabels.split('\n')[1] || ''}

                ${logger.colors.blue('Body:')}

                ${marked(pull.body || 'N/A')}
            `
        }

        if (options.link || showDetails) {
            info = `
                ${info}
                ${logger.colors.cyan(pull.html_url)}
            `
        }

        return info
            .replace(/  +/gm, '')
            .replace(/(\n\n\n)/gm, '\n')
            .trim()
    }

    function remove2ndItem(arr: any[]): any[] {
        return [arr[0], ...arr.slice(2)]
    }
}

function sortPullsByComplexity_(pulls, direction) {
    pulls.sort((a, b) => {
        if (a.complexity > b.complexity) {
            return -1
        }

        if (a.complexity < b.complexity) {
            return +1
        }

        return 0
    })

    if (direction === DIRECTION_ASC) {
        pulls.reverse()
    }

    return pulls
}
