# Node GH

[![NPM version](http://img.shields.io/npm/v/gh.svg?style=flat)](http://npmjs.org/gh)
[![NPM downloads](http://img.shields.io/npm/dm/gh.svg?style=flat)](http://npmjs.org/gh)
[![Build Status](http://img.shields.io/travis/node-gh/gh/master.svg?style=flat)](https://travis-ci.org/node-gh/gh)
[![Known Vulnerabilities](https://snyk.io/test/github/node-gh/gh/badge.svg)](https://snyk.io/test/github/node-gh/gh)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/node-gh/gh.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/node-gh/gh/context:javascript)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/node-gh/gh.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/node-gh/gh/alerts)

> All the power of GitHub in your terminal.

## Table of contents

-   [Install](#install)
-   [Usage](#usage)
-   [Demonstration](#demonstration)
-   [Supported Node Versions](#supported-node-versions)
-   [Available commands](#available-commands)
    -   [Pull requests](#pull-requests)
    -   [Notifications](#notifications)
    -   [Issues](#issues)
    -   [Repo](#repo)
    -   [Gists](#gists)
    -   [User](#user)
    -   [Alias](#alias)
-   [Config](#config)
-   [Plugins](#plugins)
-   [Team](#team)
-   [Contributing](#contributing)
-   [History](#history)
-   [License](#license)

## Install

    [sudo] npm install -g gh

## Usage

    gh [command] [payload] [--flags]

## Demonstration

<a href="https://asciinema.org/a/214594?autoplay=1">
    <p align="center">
        <img alt="Terminal Demo" src="http://nodegh.io/images/terminal-demo.svg" width="600">
    </p>
</a>

## Supported Node Versions:

-   We support the node versions that the Node.js organization supports which as of now is Node v6 & up.

<p><img src="https://raw.githubusercontent.com/nodejs/Release/master/schedule.png" alt="LTS Schedule"/></p>

## Available commands

```
gh help
```

-   List all comands options.

```
gh help --all
```

-   List specific command options.

```
gh help <command>
```

### Global flags

| Option       | Usage      | Type      |
| ------------ | ---------- | --------- |
| `--verbose`  | _Optional_ | `Boolean` |
| `--insane`   | _Optional_ | `Boolean` |
| `--no-color` | _Optional_ | `Boolean` |
| `--no-hooks` | _Optional_ | `Boolean` |

The verbose flag is useful for debugging issues.
The insane flag is a more complete verbose flag, which leaks more privacy sensitive data by default.

## Pull requests

```
gh pull-request
```

> **Alias:** `gh pr`

### 1. Info

| Option           | Usage      | Type      |
| ---------------- | ---------- | --------- |
| `-u`, `--user`   | _Required_ | `String`  |
| `-I`, `--info`   | _Required_ | `Boolean` |
| `-n`, `--number` | _Required_ | `String`  |
| `-r`, `--repo`   | _Optional_ | `String`  |
| `-u`, `--user`   | _Optional_ | `String`  |

### 2. List

| Option             | Usage        | Type                                                               |
| ------------------ | ------------ | ------------------------------------------------------------------ |
| `-l`, `--list`     | **Required** | `Boolean`                                                          |
| `-a`, `--all`      | _Optional_   | `Boolean`                                                          |
| `-O`, `--org`      | _Optional_   | `String`                                                           |
| `-m`, `--me`       | _Optional_   | `Boolean`                                                          |
| `-d`, `--detailed` | _Optional_   | `Boolean`                                                          |
| `--direction`      | _Optional_   | [`asc`, `desc`]                                                    |
| `-b`, `--branch`   | _Optional_   | `String`                                                           |
| `--remote`         | _Optional_   | `String`                                                           |
| `-r`, `--repo`     | _Optional_   | `String`                                                           |
| `--sort`           | _Optional_   | [`created`, `updated`, `popularity`, `long-running`, `complexity`] |
| `-S`, `--state`    | _Optional_   | [`open`, `closed`]                                                 |
| `-u`, `--user`     | _Optional_   | `String`                                                           |

#### Examples

-   **Shortcut** for listing open pull requests for the current repository.

```
gh pr
```

-   Get information about a pull request.

```
gh pr --info number
```

-   List open pull requests for all branches from all your repositories.

```
gh pr --list --all
```

-   List open pull requests for all branches in all repositories belonging to the "github" organization.

```
gh pr --list --all --org github
```

-   List open pull requests sent by logged user on current repository.

```
gh pr --list --me
```

-   List open pull requests with link and content.

```
gh pr --list --detailed
```

-   List open pull requests for a branch.

```
gh pr --list --branch master
```

-   List open pull requests and sort them by popularity _(comment count)_.

```
gh pr --list --sort popularity
```

-   List open pull requests and sort them by asc long-running _(old but still active)_.

```
gh pr --list --sort long-running --direction asc
```

-   List open pull requests and sort them by complexity _(complexity is calculated based on number of additions, deletions, changed files, comments and review comments)_.

```
gh pr --list --sort complexity
```

### 3. Fetch

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-f`, `--fetch`  | **Required** | `Boolean` |
| `-n`, `--number` | **Required** | `Number`  |
| `-M`, `--merge`  | _Optional_   | `Boolean` |
| `-R`, `--rebase` | _Optional_   | `Boolean` |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for fetching pull request and checkout into a new branch `pr-1`.

```
gh pr 1
```

-   Fech pull request rebasing or merging into the current branch.

```
gh pr 1 --fetch --rebase
```

```
gh pr 1 --fetch --merge
```

### 4. Merge or rebase

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-M`, `--merge`  | **Required** | `Boolean` |
| `-R`, `--rebase` | **Required** | `Boolean` |
| `-n`, `--number` | _Optional_   | `Number`  |
| `-b`, `--branch` | _Optional_   | `String`  |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |

Omitting `--number` will try to guess the pull number from branch name e.g. `pr-1` results in `--number 1`. Omitting `--branch` will merge or rebase into `config.default_branch`.

#### Examples

-   Merge or rebase pull request into a branch.

```
gh pr 1 --fetch --merge
```

```
gh pr 1 --fetch --rebase
```

-   Merge or rebase pull request into branch `dev`.

```
gh pr 1 --fetch --rebase --branch dev
```

```
gh pr 1 --fetch --merge --branch dev
```

### 5. Comment

| Option            | Usage        | Type     |
| ----------------- | ------------ | -------- |
| `-c`, `--comment` | **Required** | `String` |
| `-n`, `--number`  | **Required** | `Number` |
| `--remote`        | _Optional_   | `String` |
| `-r`, `--repo`    | _Optional_   | `String` |
| `-u`, `--user`    | _Optional_   | `String` |

#### Examples

-   Comment on a pull request.

```
gh pr 1 --comment "Merged, thank you!"
```

### 6. Forward

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `--fwd`          | **Required** | `String` |
| `-n`, `--number` | **Required** | `Number` |

Omitting a value for `--fwd` fallbacks to the `default_pr_forwarder` key found
in your [config file](#config).

#### Examples

-   Forward a pull request to another reviewer.

```
gh pr 1 --fwd username
```

### 7. Open or close

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-o`, `--open`   | **Required** | `Boolean` |
| `-C`, `--close`  | **Required** | `Boolean` |
| `-n`, `--number` | **Required** | `Number`  |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |

#### Examples

-   Open a pull request.

```
gh pr 1 --open
```

-   Close a pull request.

```
gh pr 1 --close
```

-   Close multiple pull requests.

```
gh pr --close --number 1 --number 2
```

-   Open multiple pull requests.

```
gh pr --open --number 1 --number 2
```

-   Open or close a pull request that you've sent to someone.

```
gh pr 1 --close --user eduardolundgren
```

### 8. Submit

| Option                | Usage        | Type     |
| --------------------- | ------------ | -------- |
| `-s`, `--submit`      | **Required** | `String` |
| `-b`, `--branch`      | _Optional_   | `String` |
| `-D`, `--description` | _Optional_   | `String` |
| `-i`, `--issue`       | _Optional_   | `Number` |
| `-r`, `--repo`        | _Optional_   | `String` |
| `-t`, `--title`       | _Optional_   | `String` |

Omitting a value for `--submit` fallbacks to the `default_pr_reviewer` key found
in your [config file](#config). Omitting `--title` will submit a pull request
using the last commit message as title.

#### Examples

-   Submit a pull request using the current branch.

```
gh pr --submit eduardolundgren --title 'Fix #32' --description 'Awesome fix'
```

-   Submit a pull request using the current branch to dev branch.

```
gh pr --submit eduardolundgren --branch dev
```

-   Submit a pull request from a issue.

```
gh pr --submit eduardolundgren --issue 150
```

### 9. Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-n`, `--number`  | **Required** | `Number`  |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-r`, `--repo`    | _Optional_   | `String`  |

#### Examples

-   Open GitHub pull request page in the browser.

```
gh pr 100 --browser
```

## Notifications

```
gh notification
```

> **Alias:** `gh nt`

### 1. Latest

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-l`, `--latest` | **Required** | `Boolean` |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for displaying the latest activities on the current repository.

```
gh nt
```

-   Display the latest activities on a certain repository.

```
gh nt --latest --user eduardolundgren --repo node-gh
```

### 2. Watch

| Option          | Usage        | Type      |
| --------------- | ------------ | --------- |
| `-w`, `--watch` | **Required** | `Boolean` |
| `--remote`      | _Optional_   | `String`  |
| `-r`, `--repo`  | _Optional_   | `String`  |
| `-u`, `--user`  | _Optional_   | `String`  |

#### Examples

-   Watch for any activity on the current repository.

```
gh nt --watch
```

-   Watch for any activity on a certain repository.

```
gh nt --watch --user eduardolundgren --repo node-gh
```

## Issues

```
gh issue
```

> **Alias:** `gh is`

### 1. Create

| Option             | Usage        | Type      |
| ------------------ | ------------ | --------- |
| `-N`, `--new`      | **Required** | `Boolean` |
| `-t`, `--title`    | **Required** | `String`  |
| `-A`, `--assignee` | _Optional_   | `String`  |
| `-L`, `--label`    | _Optional_   | `String`  |
| `-m`, `--message`  | _Optional_   | `String`  |
| `--remote`         | _Optional_   | `String`  |
| `-r`, `--repo`     | _Optional_   | `String`  |
| `-u`, `--user`     | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for creating a new issue on the current repository.

```
gh is 'Node GH rocks!' 'Body with **Markdown** support'
```

-   Create a new issue on a certain repository.

```
gh is --new --title 'Node GH rocks!' --message 'Body with **Markdown** support' --user eduardolundgren --repo node-gh
```

-   Create a new issue with labels.

```
gh is --new --title 'Node GH rocks!' --label bug,question,test
```

-   Create a new issue and assign it to someone.

```
gh is --new --title 'Node GH rocks!' --assignee zenorocha
```

### 2. Comment

| Option            | Usage        | Type     |
| ----------------- | ------------ | -------- |
| `-c`, `--comment` | **Required** | `String` |
| `-n`, `--number`  | **Required** | `Number` |
| `--remote`        | _Optional_   | `String` |
| `-r`, `--repo`    | _Optional_   | `String` |
| `-u`, `--user`    | _Optional_   | `String` |

#### Examples

-   Comment on an issue of the current repository.

```
gh is 1 --comment 'Node GH rocks!'
```

-   Comment on an issue of a certain repository.

```
gh is 1 --comment 'Node GH rocks!' --user eduardolundgren --repo node-gh
```

### 3. Open or close

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-o`, `--open`   | **Required** | `Boolean` |
| `-C`, `--close`  | **Required** | `Boolean` |
| `-n`, `--number` | **Required** | `Number`  |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |

#### Examples

-   Open an issue.

```
gh is 1 --open
```

-   Close an issue.

```
gh is 1 --close
```

-   Close multiple issues.

```
gh is --close --number 1 --number 2
```

-   Open multiple issues.

```
gh is --open --number 1 --number 2
```

-   Open or close an issue that you've sent to someone.

```
gh is 1 --close --user eduardolundgren
```

### 4. List

| Option              | Usage        | Type                 |
| ------------------- | ------------ | -------------------- |
| `-l`, `--list`      | **Required** | `Boolean`            |
| `-a`, `--all`       | _Optional_   | `Boolean`            |
| `-A`, `--assignee`  | _Optional_   | `String`             |
| `-d`, `--detailed`  | _Optional_   | `Boolean`            |
| `-L`, `--label`     | _Optional_   | `String`             |
| `-M`, `--milestone` | _Optional_   | [`Number`, `String`] |
| `--remote`          | _Optional_   | `String`             |
| `-r`, `--repo`      | _Optional_   | `String`             |
| `-S`, `--state`     | _Optional_   | [`open`, `closed`]   |
| `-u`, `--user`      | _Optional_   | `String`             |

#### Examples

-   **Shortcut** for listing all issues on the current repository.

```
gh is
```

-   List all issues from all repositories.

```
gh is --list --all
```

-   List issues assigned to someone.

```
gh is --list --assignee zenorocha
```

-   List issues with link and content.

```
gh is --list --detailed
```

-   List only closed issues on the current repository.

```
gh is --list --state closed
```

-   List issues filtered by milestone.

```
gh is --list --milestone 1
```

-   List issues that contains labels `todo` and `bug`.

```
gh is --list --label todo,bug
```

-   List all issues on a certain repository.

```
gh is --list --user eduardolundgren --repo node-gh
```

### 5. Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-n`, `--number`  | **Required** | `Number`  |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-r`, `--repo`    | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for opening GitHub issue page in the browser.

```
gh is 100
```

-   Open GitHub issue page in the browser.

```
gh is 100 --browser
```

### 6. Search

| Option             | Usage        | Type      |
| ------------------ | ------------ | --------- |
| `-s`, `--search`   | **Required** | `Boolean` |
| `-a`, `--all`      | _Optional_   | `Boolean` |
| `-d`, `--detailed` | _Optional_   | `Boolean` |
| `-r`, `--repo`     | _Optional_   | `String`  |
| `-u`, `--user`     | _Optional_   | `String`  |

#### Examples

-   Search issues in current repository

```
gh is --search 'term'
```

-   Search issues in all repositories for a user

```
gh is --all --user node-gh --search 'term'
```

-   Search issues in a repository for a user

```
gh is  --user node-gh --repo gh --search 'term'
```

-   Search issues in a repository for a user with link and content

```
gh is  --user node-gh --repo gh --search 'term'
```

-   Search issues with github filters

```
gh is  --user node-gh --repo gh --search 'updated:<=2013-05-24'
```

### 7. Assign

| Option             | Usage        | Type      |
| ------------------ | ------------ | --------- |
| `--assign`         | **Required** | `Boolean` |
| `-A`, `--assignee` | **Required** | `String`  |
| `-n`, `--number`   | **Required** | `Number`  |
| `-r`, `--repo`     | _Optional_   | `String`  |
| `-u`, `--user`     | _Optional_   | `String`  |

#### Examples

-   Assign an issue on the current repository to a user.

```
gh is --assign --assignee zenorocha --number 1
```

-   Assign an issue on a specific repository to a user.

```
gh is --assign --assignee zenorocha --number 1 --user eduardolundgren --repo gh
```

## Repo

```
gh repo
```

> **Alias:** `gh re`

### 1. Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-r`, `--repo`    | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for opening the GitHub repository page in the browser.

```
gh re
```

-   Open GitHub repository page in the browser.

```
gh re --browser --user eduardolundgren --repo node-gh
```

### 2. List

| Option             | Usage        | Type                                            |
| ------------------ | ------------ | ----------------------------------------------- |
| `-l`, `--list`     | **Required** | `Boolean`                                       |
| `-d`, `--detailed` | _Optional_   | `Boolean`                                       |
| `-u`, `--user`     | _Optional_   | `String`                                        |
| `-t`, `--type`     | _Optional_   | [`all`, `owner`, `public`, `private`, `member`] |

#### Examples

-   List all repositories.

```
gh re --list
```

-   List all private repositories.

```
gh re --list --type private
```

-   List all repositories from someone.

```
gh re --list --user zenorocha
```

### 3. Create

| Option                 | Usage        | Type        |
| ---------------------- | ------------ | ----------- |
| `-N`, `--new`          | **Required** | `String`    |
| `-O`, `--organization` | _Optional_   | `String`    |
| `-c`, `--clone`        | _Optional_   | `Boolean`   |
| `-t`, `--type`         | _Optional_   | [`private`] |
| `--init`               | _Optional_   | `Boolean`   |
| `--gitignore`          | _Optional_   | `String`    |
| `--homepage`           | _Optional_   | `String`    |
| `--description`        | _Optional_   | `String`    |

#### Examples

-   Create a new GitHub repository and clone on the current directory.

```
gh re --new foo --clone
```

-   Create a new GitHub repository for an organization.

```
gh re --new foo --organization node-gh
```

-   Create a new GitHub repository using .gitignore template for Ruby.

```
gh re --new gemified --gitignore Ruby
```

-   Create a new private repository on GitHub, initializing it with a initial commit of the README.

```
gh re --new foo --init --type private
```

### 4. Fork

| Option                 | Usage        | Type     |
| ---------------------- | ------------ | -------- |
| `-f`, `--fork`         | **Required** | `String` |
| `-u`, `--user`         | **Required** | `String` |
| `-O`, `--organization` | _Optional_   | `String` |

#### Examples

-   Fork a GitHub repository.

```
gh re --fork repo --user user
```

-   Fork a GitHub repository into the node-gh organization.

```
gh re --fork repo --user user --organization node-gh
```

### 5. Delete

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `-D`, `--delete` | **Required** | `String` |
| `-u`, `--user`   | **Required** | `String` |

#### Example

-   Delete a repository of the logged user.

```
gh re --delete foo
```

### 6. Clone

| Option                 | Usage        | Type     |
| ---------------------- | ------------ | -------- |
| `-c`, `--clone`        | **Required** | `String` |
| `-r`, `--repo`         | **Required** | `String` |
| `-O`, `--organization` | _Optional_   | `String` |
| `-P`, `--protocol`     | _Optional_   | `String` |
| `-u`, `--user`         | _Optional_   | `String` |

#### Examples

-   Clone a repository.

```
gh re --clone --repo gh
```

-   Clone a repository from a specific user using HTTPS protocol.

```
gh re --clone --user eduardolundgren --repo gh --protocol https
```

### 7. Create Label

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-C`, `--color`        | **Required** | `String`  |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-N`, `--new`          | **Required** | `String`  |
| `-r`, `--repo`         | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

-   Create a label for a repository.

```
gh re --label --new bug --color color --repo gh
```

-   Create a label for a user's repository.

```
gh re --label --new bug --color color --user eduardolundgren --repo gh
```

### 8. Delete Label

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-D`, `--delete`       | **Required** | `String`  |
| `-r`, `--repo`         | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

-   Delete a label from a repository.

```
gh re --label --delete bug --repo gh
```

-   Delete a label from a user's repository.

```
gh re --label --delete bug --user eduardolundgren --repo gh
```

### 9. List Labels

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-l`, `--list`         | **Required** | `Boolean` |
| `-r`, `--repo`         | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

-   List labels for a repository.

```
gh re --label --list --repo gh
```

-   List labels for a user's repository.

```
gh re --label --list --user eduardolundgren --repo gh
```

### 10. Update Label

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-C`, `--color`        | **Required** | `String`  |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-r`, `--repo`         | **Required** | `String`  |
| `-U`, `--update`       | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

-   Update a label for a repository.

```
gh re --label --update bug --color color --repo gh
```

-   Update a label for a user's repository.

```
gh re --label --update bug --color color --user eduardolundgren --repo gh
```

## Gists

```
gh gists
```

> **Alias:** `gh gi`

### 1. Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-i`, `--id`      | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for opening your Gists in the browser.

```
gh gi
```

-   Open a Gist in the browser.

```
gh gi --browser --id 5991877
```

### 2. List

| Option         | Usage        | Type      |
| -------------- | ------------ | --------- |
| `-l`, `--list` | **Required** | `Boolean` |
| `-u`, `--user` | _Optional_   | `String`  |

#### Examples

-   List all gists.

```
gh gi --list
```

-   List all gists from someone.

```
gh gi --list --user brunocoelho
```

### 3. Create

| Option                | Usage        | Type      |
| --------------------- | ------------ | --------- |
| `-N`, `--new`         | **Required** | `String`  |
| `-c`, `--content`     | _Optional_   | `String`  |
| `-d`, `--description` | _Optional_   | `String`  |
| `-p`, `--private`     | _Optional_   | `Boolean` |

#### Examples

-   Create a Gist `hello` containing "Hello World".

```
gh gi --new hello --content "Hello World!"
```

-   Create a private Gist `hello` containing "Hello World".

```
gh gi --new hello --content "Hello World!" --private
```

### 4. Fork

| Option         | Usage        | Type     |
| -------------- | ------------ | -------- |
| `-f`, `--fork` | **Required** | `String` |

#### Examples

-   Fork a Gist.

```
gh gi --fork 5444883
```

### 5. Delete

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `-D`, `--delete` | **Required** | `String` |

#### Example

-   Delete a Gist.

```
gh gi --delete 4252323
```

-   Delete multiple Gists.

```
gh gi --delete 4252321 --delete 4252322
```

## User

```
gh user
```

> **Alias:** `gh us`

### 1. Login/Logout

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-l`, `--login`  | **Required** | `Boolean` |
| `-L`, `--logout` | **Required** | `Boolean` |

#### Examples

-   Login or show current logged in GitHub user.

```
gh user --login
```

-   Logout current GitHub account.

```
gh user --logout
```

### 2. Whoami

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-w`, `--whoami` | **Required** | `Boolean` |

#### Examples

-   Prints your username to stdout.

```
gh user --whoami
```

## Alias

```
gh alias
```

> **Alias:** `gh al`

### 1. List

| Option         | Usage        | Type      |
| -------------- | ------------ | --------- |
| `-l`, `--list` | **Required** | `Boolean` |

#### Examples

-   **Shortcut** for listing aliases.

```
gh alias
```

-   List aliases.

```
gh alias --list
```

### 2. Add

| Option         | Usage        | Type     |
| -------------- | ------------ | -------- |
| `-a`, `--add`  | **Required** | `String` |
| `-u`, `--user` | **Required** | `String` |

#### Examples

-   Create alias for username.

```
gh alias --add zeno --user zenorocha
```

### 3. Remove

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `-r`, `--remove` | **Required** | `String` |

#### Examples

-   Remove alias.

```
gh alias --remove zeno
```

## Config

There are some pretty useful configurations that you can set on [.gh.json](default.gh.json).
This file can be found under home directory _(on MacOSx: `/Users/yourName/.gh.json` on Windows: `C:\\Users\yourName\.gh.json`)_.

You can also set per-project configurations by adding a `.gh.json` file in your project's root folder and overriding existing keys.

-   GitHub API configurations. Change it if you're a [GitHub Enterprise](https://enterprise.github.com/) user.

```javascript
"api": {
    "host": "github.mydomain.com",
    "protocol": "https",
    "version": "3.0.0",
    "pathPrefix": "/api/v3"
}
```

-   Set default branch and remote.

```javascript
"default_branch": "master",
"default_remote": "origin"
```

-   Set default users when [submitting](#7-submit) or [forwarding](#5-forward) pull requests.

```javascript
"default_pr_forwarder": "",
"default_pr_reviewer": ""
```

-   GitHub data filled once you log in.

```javascript
"github_token": "",
"github_user": ""
```

-   Run automated tasks before or after a certain command.

```javascript
"hooks": {
        "pull-request": {
            "merge": {
                "before": [{"cmd": "ls -la", "log": true}],
                "after": [
                    "gh pr {{options.number}} --comment 'Thank you, pull request merged :D'"
                ]
            }
        }
}
```

-   Run automated tasks passing arguments to the commands. Required for prompt commands.

```javascript
"hooks": {
        "pull-request": {
            "merge": {
                "before": [{"cmd": "foo", "args": ["bar", "qux"]}]
            }
        }
}
```

-   Set default branch name prefix for PR fetching.

```javascript
"pull_branch_name_prefix": "pr-"
```

-   Insert signature below issue comment.

```javascript
"signature": "<br><br>:octocat: *Sent from [GH](http://nodegh.io).*"
```

-   Turn off ssh when pulling a repo and use https instead.

```javascript
"ssh": false,
```

If you need to use a custom git command, set the environment variable `GH_GIT_COMMAND`.

## Plugins

-   [GH Gif](https://github.com/node-gh/gh-gif) - A plugin for commenting on pull requests/issues using GIF reactions.
-   [GH Travis](https://github.com/node-gh/gh-travis) - A plugin for integrating Travis, a continous integration server.
-   [GH Jira](https://github.com/node-gh/gh-jira) - A plugin for integrating Jira, an issue management system.

Feel free to create your own plugins by forking [GH Boilerplate](https://github.com/node-gh/gh-boilerplate).

## Team

Node GH is maintained by these guys and [some awesome contributors](CONTRIBUTORS).

| Contributors                                                                                                                                                                         |                                                                                                                                                                       |                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![Eduardo Lundgren](http://gravatar.com/avatar/42327de520e674a6d1686845b30778d0?s=70)](https://github.com/eduardolundgren/) [Eduardo Lundgren](https://github.com/eduardolundgren/) | [![Zeno Rocha](http://gravatar.com/avatar/e190023b66e2b8aa73a842b106920c93?s=70)](https://github.com/zenorocha/) [Zeno Rocha](https://github.com/zenorocha/)          | [![Henrique Vicente](http://gravatar.com/avatar/5733fd332f2a0da11931e0e73ddfb20d?s=70)](https://github.com/henvic/) [Henrique Vicente](https://github.com/henvic/)   |
| [![Bruno Coelho](http://gravatar.com/avatar/1f90c690b534779560d3bfdb23772915?s=70)](https://github.com/brunocoelho/) [Bruno Coelho](https://github.com/brunocoelho/)                 | [![Dustin Ryerson](https://avatars2.githubusercontent.com/u/2080476?v=3&s=70)](https://github.com/dustinryerson/) [Dustin Ryerson](https://github.com/dustinryerson/) | [![Ryan Garant](https://avatars1.githubusercontent.com/u/20076677?s=70&v=4)](https://github.com/protoEvangelion/) [Ryan Garant](https://github.com/protoEvangelion/) |

## Contributing

For detailed instructions, check [Contributing](https://github.com/node-gh/gh/blob/master/CONTRIBUTING.md). Don't miss the [source code reports](https://node-gh.github.io/reports/).

## History

For detailed changelog, check [Releases](https://github.com/node-gh/gh/releases).

## License

[BSD-3-Clause](https://github.com/node-gh/gh/blob/master/LICENSE.txt)
