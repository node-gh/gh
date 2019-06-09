export interface IRepoIssue {
    repository: {
        issue: {
            id: number
        }
    }
}

export interface IRepoIssues {
    repository: {
        issues: {
            edges: object[]
            pageInfo: IPaginationInfo
        }
    }
}

export interface IPaginationInfo {
    hasPreviousPage?: boolean
    startCursor?: string
}

export interface IRemoteInfo {
    remote: string
    repo: string
    user: string
}

export interface IBaseIssueParams {
    owner: string
    repo: string
}

export interface IStateIssueParams extends IBaseIssueParams {
    number: number
    state: 'open' | 'closed'
}

export interface INewIssueParams extends IBaseIssueParams {
    owner: string
    repo: string
    title: string
    body?: string
    assignees?: string[]
    milestone?: number
    labels?: string[]
}

export interface ISearchIssuesParams {
    q: string
    sort?: 'comments' | 'created' | 'updated'
    order?: 'asc' | 'desc'
    per_page?: number
    page?: number
}

export interface IFlags {
    name: string
    char?: string
    description?: string
    hidden?: boolean
    required?: boolean
    dependsOn?: string[]
    exclusive?: string[]
    env?: string
}
