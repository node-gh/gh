# Node GH [![Build Status](https://secure.travis-ci.org/node-gh/gh.png?branch=master)](https://travis-ci.org/node-gh/gh) [![NPM version](https://badge.fury.io/js/gh.png)](http://badge.fury.io/js/gh) [![Dependency Status](https://david-dm.org/node-gh/gh.png)](https://david-dm.org/node-gh/gh)

![Class Octocat](http://nodegh.io/images/class-octocat.jpg)

> All the power of GitHub in your terminal.

## Table of contents

* [Install](#install)
* [Usage](#usage)
* [Dependencies](#dependencies)
* [Demonstration](#demonstration)
* [Available commands](#available-commands)
    * [Pull requests](#pull-requests)
    * [Notifications](#notifications)
    * [Issues](#issues)
    * [Repo](#repo)
    * [User](#user)
    * [Alias](#alias)
* [Config](#config)
* [Plugins](#plugins)
* [Testing](#testing)
* [Team](#team)
* [Contributing](#contributing)
* [History](#history)
* [License](#license)

## Install

    [sudo] npm install -g gh

## Usage

    gh [command] [payload] [--flags]

## Dependencies

In order to sucessfully run this project you must have [NodeJS](http://nodejs.org/download/) installed.

## Demonstration

[![Demo](http://nodegh.io/images/nodegh-demo.jpg)](http://ascii.io/a/3391/)

## Available commands

```
gh help
```

## Pull requests

```
gh pull-request
```

> **Alias:** `gh pr`

### 1. List

Option            | Usage        | Type
---               | ---          | ---
`-l`, `--list`    | **Required** | `Boolean`
`-a`, `--all`     | *Optional*   | `Boolean`
`-d`, `--detailed`| *Optional*   | `Boolean`
`-b`, `--branch`  | *Optional*   | `String`
`--remote`        | *Optional*   | `String`
`-r`, `--repo`    | *Optional*   | `String`
`-S`, `--state`   | *Optional*   | [`open`, `closed`]
`-u`, `--user`    | *Optional*   | `String`

#### Examples

* **Shortcut** for listing open pulls requests for the current branch.

    ```
gh pr
    ```

* List open pulls requests for all branches.

    ```
gh pr --list --all
    ```

* List open pulls requests with link and content.

    ```
gh pr --list --detailed
    ```

* List open pulls requests for a branch.

    ```
gh pr --list --branch master
    ```

### 2. Fetch

Option           | Usage        | Type
---              | ---          | ---
`-f`, `--fetch`  | **Required** | `Boolean`
`-n`, `--number` | **Required** | `Number`
`-M`, `--merge`  | *Optional*   | `Boolean`
`-R`, `--rebase` | *Optional*   | `Boolean`
`--remote`       | *Optional*   | `String`
`-r`, `--repo`   | *Optional*   | `String`
`-u`, `--user`   | *Optional*   | `String`

#### Examples

* **Shortcut** for fetching pull request and checkout into a new branch `pull-1`.

    ```
gh pr 1
    ```

* Fech pull request rebasing or merging into the current branch.

    ```
gh pr 1 --fetch --rebase
    ```
    ```
gh pr 1 --fetch --merge
    ```

### 3. Merge or rebase

Option           | Usage        | Type
---              | ---          | ---
`-M`, `--merge`  | **Required** | `Boolean`
`-R`, `--rebase` | **Required** | `Boolean`
`-n`, `--number` | *Optional*   | `Number`
`-b`, `--branch` | *Optional*   | `String`
`--remote`       | *Optional*   | `String`
`-r`, `--repo`   | *Optional*   | `String`
`-u`, `--user`   | *Optional*   | `String`

Omitting `--number` will try to guess the pull number from branch name e.g. `pr-1` results in `--number 1`. Omitting `--branch` will merge or rebase into `config.default_branch`.

#### Examples

* Merge or rebase pull request into a branch.

    ```
gh pr 1 --fetch --merge
    ```

    ```
gh pr 1 --fetch --rebase
    ```

* Merge or rebase pull request into branch `dev`.

    ```
gh pr 1 --fetch --rebase --branch dev
    ```

    ```
gh pr 1 --fetch --merge --branch dev
    ```

### 4. Comment

Option           | Usage        | Type
---              | ---          | ---
`-c`, `--comment`| **Required** | `String`
`-n`, `--number` | **Required** | `Number`
`--remote`       | *Optional*   | `String`
`-r`, `--repo`   | *Optional*   | `String`
`-u`, `--user`   | *Optional*   | `String`

#### Examples

* Comment on a pull request.

    ```
gh pr 1 --comment "Merged, thank you!"
    ```

### 5. Forward

Option           | Usage        | Type
---              | ---          | ---
`--fwd`          | **Required** | `String`
`-n`, `--number` | **Required** | `Number`

#### Examples

* Forward a pull request to another reviewer.

    ```
gh pr 1 --fwd username
    ```

### 6. Open or close

Option           | Usage        | Type
---              | ---          | ---
`-o`, `--open`   | **Required** | `Boolean`
`-C`, `--close`  | **Required** | `Boolean`
`-n`, `--number` | **Required** | `Number`
`--remote`       | *Optional*   | `String`
`-r`, `--repo`   | *Optional*   | `String`
`-u`, `--user`   | *Optional*   | `String`

#### Examples

* Open a pull request.

    ```
gh pr 1 --open
    ```
* Close a pull request.

    ```
gh pr 1 --close
    ```

* Close multiple pull requests.

	```
gh pr --close --number 1 --number 2
	```

* Open multiple pull requests.

	```
gh pr --open --number 1 --number 2
	```

* Open or close a pull request that you've sent to someone.

    ```
gh pr 1 --close --user eduardolundgren
    ```

### 7. Submit

Option                  | Usage        | Type
---                     | ---          | ---
`-s`, `--submit`        | **Required** | `String`
`-b`, `--branch`        | *Optional*   | `String`
`-D`, `--description`   | *Optional*   | `String`
`-i`, `--issue`         | *Optional*   | `Number`
`-r`, `--repo`          | *Optional*   | `String`
`-t`, `--title`         | *Optional*   | `String`

Omitting `--title` will submit a pull request using the last commit message as title.

#### Examples

* Submit a pull request using the current branch.

    ```
gh pr --submit eduardolundgren --title 'Fix #32' --description 'Awesome fix'
    ```

* Submit a pull request using the current branch to dev branch.

    ```
gh pr --submit eduardolundgren --branch dev
    ```

* Submit a pull request from a issue.

    ```
gh pr --submit eduardolundgren --issue 150
    ```

### 8. Open in Browser

Option                 | Usage        | Type
---                    | ---          | ---
`-B`, `--browser`      | **Required** | `Boolean`
`-n`, `--number`       | **Required** | `Number`
`-u`, `--user`         | *Optional*   | `String`
`-r`, `--repo`         | *Optional*   | `String`

#### Examples

* Open GitHub pull request page in the browser.

    ```
gh pr 100 --browser
    ```

## Notifications

```
gh notification
```

> **Alias:** `gh nt`


### 1. Latest

Option           | Usage        | Type
---              | ---          | ---
`-l`, `--latest` | **Required** | `Boolean`
`--remote`       | *Optional*   | `String`
`-r`, `--repo`   | *Optional*   | `String`
`-u`, `--user`   | *Optional*   | `String`

#### Examples

* **Shortcut** for displaying the latest activities on the current repository.

    ```
gh nt
    ```

* Display the latest activities on a certain repository.

    ```
gh nt --latest --user eduardolundgren --repo node-gh
    ```

### 2. Watch

Option           | Usage        | Type
---              | ---          | ---
`-w`, `--watch`  | **Required** | `Boolean`
`--remote`       | *Optional*   | `String`
`-r`, `--repo`   | *Optional*   | `String`
`-u`, `--user`   | *Optional*   | `String`

#### Examples

* Watch for any activity on the current repository.

    ```
gh nt --watch
    ```

* Watch for any activity on a certain repository.

    ```
gh nt --watch --user eduardolundgren --repo node-gh
    ```

## Issues

```
gh issue
```

> **Alias:** `gh is`

### 1. Create

Option            | Usage        | Type
---               | ---          | ---
`-N`, `--new`     | **Required** | `Boolean`
`-t`, `--title`   | **Required** | `String`
`-A`, `--assignee`| *Optional*   | `String`
`-L`, `--label`   | *Optional*   | `String`
`-m`, `--message` | *Optional*   | `String`
`--remote`        | *Optional*   | `String`
`-r`, `--repo`    | *Optional*   | `String`
`-u`, `--user`    | *Optional*   | `String`

#### Examples

* **Shortcut** for creating a new issue on the current repository.

    ```
gh is 'Node GH rocks!' 'Body with **Markdown** support'
    ```

* Create a new issue on a certain repository.

    ```
gh is --new --title 'Node GH rocks!' --message 'Body with **Markdown** support' --user eduardolundgren --repo node-gh
    ```

* Create a new issue with labels.

    ```
gh is --new --title 'Node GH rocks!' --label bug,question,test
    ```

* Create a new issue and assign it to someone.

    ```
gh is --new --title 'Node GH rocks!' --assignee zenorocha
    ```

### 2. Comment

Option            | Usage        | Type
---               | ---          | ---
`-c`, `--comment` | **Required** | `String`
`-n`, `--number`  | **Required** | `Number`
`--remote`        | *Optional*   | `String`
`-r`, `--repo`    | *Optional*   | `String`
`-u`, `--user`    | *Optional*   | `String`

#### Examples

* Comment on an issue of the current repository.

    ```
gh is 1 --comment 'Node GH rocks!'
    ```

* Comment on an issue of a certain repository.

    ```
gh is 1 --comment 'Node GH rocks!' --user eduardolundgren --repo node-gh
    ```

### 3. Open or close

Option           | Usage        | Type
---              | ---          | ---
`-o`, `--open`   | **Required** | `Boolean`
`-C`, `--close`  | **Required** | `Boolean`
`-n`, `--number` | **Required** | `Number`
`--remote`       | *Optional*   | `String`
`-r`, `--repo`   | *Optional*   | `String`
`-u`, `--user`   | *Optional*   | `String`

#### Examples

* Open an issue.

    ```
gh is 1 --open
    ```
* Close an issue.

    ```
gh is 1 --close
    ```

* Close multiple issues.

	```
gh is --close --number 1 --number 2
	```

* Open multiple issues.

	```
gh is --open --number 1 --number 2
	```

* Open or close an issue that you've sent to someone.

    ```
gh is 1 --close --user eduardolundgren
    ```

### 4. List

Option             | Usage        | Type
---                | ---          | ---
`-l`, `--list`     | **Required** | `Boolean`
`-a`, `--all`      | *Optional*   | `Boolean`
`-A`, `--assignee` | *Optional*   | `String`
`-d`, `--detailed` | *Optional*   | `Boolean`
`-L`, `--label`    | *Optional*   | `String`
`-M`, `--milestone`| *Optional*   | `Number`
`--remote`         | *Optional*   | `String`
`-r`, `--repo`     | *Optional*   | `String`
`-S`, `--state`    | *Optional*   | [`open`, `closed`]
`-u`, `--user`     | *Optional*   | `String`

#### Examples

* **Shortcut** for listing all issues on the current repository.

    ```
gh is
    ```

* List all issues from all repositories.

    ```
gh is --list --all
    ```

* List issues assigned to someone.

    ```
gh is --list --assignee zenorocha
    ```

* List issues with link and content.

    ```
gh is --list --detailed
    ```

* List only closed issues on the current repository.

    ```
gh is --list --state closed
    ```

* List issues filtered by milestone.

    ```
gh is --list --milestone 1
    ```

* List issues that contains labels `todo` and `bug`.

    ```
gh is --list --label todo,bug
    ```

* List all issues on a certain repository.

    ```
gh is --list --user eduardolundgren --repo node-gh
    ```

### 5. Open in Browser

Option                 | Usage        | Type
---                    | ---          | ---
`-B`, `--browser`      | **Required** | `Boolean`
`-n`, `--number`       | **Required** | `Number`
`-u`, `--user`         | *Optional*   | `String`
`-r`, `--repo`         | *Optional*   | `String`

#### Examples

* Open GitHub issue page in the browser.

    ```
gh is 100 --browser
    ```

## Repo
```
gh repo
```

> **Alias:** `gh re`

### 1. Open in Browser

Option                 | Usage        | Type
---                    | ---          | ---
`-B`, `--browser`      | **Required** | `Boolean`
`-u`, `--user`         | *Optional*   | `String`
`-r`, `--repo`         | *Optional*   | `String`

#### Examples

* **Shortcut** for opening the GitHub repository page in the browser.

    ```
gh re
    ```

* Open GitHub repository page in the browser.

    ```
gh re --browser --user eduardolundgren --repo node-gh
    ```

### 2. List

Option                 | Usage        | Type
---                    | ---          | ---
`-l`, `--list`         | **Required** | `Boolean`
`-d`, `--detailed`     | *Optional*   | `Boolean`
`-u`, `--user`         | *Optional*   | `String`
`-t`, `--type`         | *Optional*   | [`all`, `owner`, `public`, `private`, `member`]

#### Examples

* List all repositories.

    ```
gh re --list
    ```

* List all private repositories.

    ```
gh re --list --type private
    ```

* List all repositories for someone.

    ```
gh re --list --user zenorocha
    ```

### 3. Create

Option                | Usage        | Type
---                   | ---          | ---
`-n`, `--new`         | **Required** | `String`
`-c`, `--clone`       | *Optional*   | `Boolean`
`-t`, `--type`        | *Optional*   | [`private`]
`--init`              | *Optional*   | `Boolean`
`--gitignore`         | *Optional*   | `String`
`--homepage`          | *Optional*   | `String`
`--description`       | *Optional*   | `String`

#### Examples

* Create a new GitHub repository and clone on the current directory.

    ```
gh re --new foo --clone
    ```

* Create a new GitHub repository using .gitignore template for Ruby.

    ```
gh re --new gemified --gitignore Ruby
    ```

* Create a new private repository on GitHub, initializing it with a initial commit of the README.

    ```
gh re --new foo --init --type private
    ```

### 4. Fork

Option                | Usage        | Type
---                   | ---          | ---
`-f`, `--fork`        | **Required** | `String`
`-u`, `--user`        | **Required** | `String`
`-O`, `--organization`| **Optional** | `Boolean`

#### Examples

* Fork a GitHub repository.

    ```
gh re --fork yui3 --user yui
    ```

* Fork a GitHub repository into the node-gh organization.

    ```
gh re --fork alloy-ui --user liferay --organization node-gh
    ```


### 5. Delete

Option                | Usage        | Type
---                   | ---          | ---
`-D`, `--delete`      | **Required** | `String`
`-u`, `--user`        | **Required** | `String`

#### Example

* Delete a repository of the logged user.

    ```
gh re --delete foo
    ```

## User

```
gh user
```

> **Alias:** `gh us`

### 1. Login/Logout

Option            | Usage        | Type
---               | ---          | ---
`-l`, `--login`   | **Required** | `Boolean`
`-L`, `--logout`  | **Required** | `Boolean`

#### Examples

* Login or show current logged in GitHub user.

    ```
gh user --login
    ```

* Logout current GitHub account.

    ```
gh user --logout
    ```

## Alias

```
gh alias
```

> **Alias:** `gh al`

### 1. List

Option            | Usage        | Type
---               | ---          | ---
`-l`, `--list`    | **Required** | `Boolean`

#### Examples

* **Shortcut** for listing aliases.

    ```
gh alias
    ```

* List aliases.

    ```
gh alias --list
    ```

### 2. Add

Option            | Usage        | Type
---               | ---          | ---
`-a`, `--add`     | **Required** | `String`
`-u`, `--user`    | **Required** | `String`

#### Examples

* Create alias for username.

    ```
gh alias --add zeno --user zenorocha
    ```

### 3. Remove

Option            | Usage        | Type
---               | ---          | ---
`-r`, `--remove`  | **Required** | `String`

#### Examples

* Remove alias.

    ```
gh alias --remove zeno
    ```

## Config

There are some pretty useful configurations that you can set on [.gh.json](https://github.com/node-gh/gh/blob/master/.gh.json).
This file can be found under home directory *(on MacOSx: `/Users/yourName/.gh.json` on Windows: `C:\\Users\yourName\.gh.json`)*.

* Set default branch and remote.

    ```javascript
"default_branch": "master",
"default_remote": "origin"
    ```

* GitHub data filled once you log in.

    ```javascript
"github_token": "",
"github_user": ""
    ```

* Automate tasks to be runned before or after a certain command.

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

* Set default branch name prefix for PR fetching.

    ```javascript
"pull_branch_name_prefix": "pr-"
    ```

* Insert signature below issue comment.

    ```javascript
"signature": "<br><br>:octocat: *Sent from [GH](http://nodegh.io).*"
    ```

## Plugins

* [GH Gif](https://github.com/node-gh/gh-gif) - A plugin for commenting on pull requests/issues using GIF reactions.
* [GH Travis](https://github.com/node-gh/gh-travis) - A plugin for integrating Travis, a continous integration server.

Feel free to create your own plugins by forking [GH Boilerplate](https://github.com/node-gh/gh-boilerplate).

## Testing

Check [Travis](https://travis-ci.org/node-gh/gh) for continous integration results.

* Run [JSHint](http://www.jshint.com/), a tool to detect errors and potential problems.

    ```
npm run-script lint
    ```

* Run [Mocha](http://visionmedia.github.io/mocha/), a unit test framework.

    ```
npm run-script test
    ```

## Team

Node GH is maintained by these guys and some awesome [contributors](https://github.com/node-gh/gh/graphs/contributors).

[![Eduardo Lundgren](http://gravatar.com/avatar/42327de520e674a6d1686845b30778d0?s=70)](https://github.com/eduardolundgren/) | [![Zeno Rocha](http://gravatar.com/avatar/e190023b66e2b8aa73a842b106920c93?s=70)](https://github.com/zenorocha/)
--- | ---
[Eduardo Lundgren](https://github.com/eduardolundgren/) | [Zeno Rocha](https://github.com/zenorocha/)

## Contributing

Contribute new commands to this project by copying and editing the content of [Hello World](https://github.com/node-gh/gh/blob/master/lib/cmds/hello.js) example.

## History

* **v1.6.1** September 19, 2013
    * Forwarding pull request generates wrong "See changes" link
* **v1.6.0** September 19, 2013
    * Accept multiple number values `gh pr --close -n 1 -n 2`
    * Add plugins info on the help command
    * Fix `gh is --list --all`
    * Fix bug with notifications command
    * Improve hability to guess default command
* **v1.5.1** September 15, 2013
    * Use original pull request title when forwarding a pull request
    * Use only the first line of the commit when creating pull requests
    * Fix message when forwarding a pull request
* **v1.5.0** September 13, 2013
    * Rename repository to `gh`
    * Move repository to `node-gh` organization
    * Add plugin infrastructure
    * Add option to show the STDOUT of a hook
    * Use best user value based on execution scope
    * Add feature to create pull requests from an existing issue
    * Fix GitHub links to use https instead of http
    * Fix printing correct username on `gh pr -l`
* **v1.4.0** September 11, 2013
    * Add hooks feature \o/
    * Document config files
* **v1.3.2** September 9, 2013
    * Add ability to open GitHub website from commands
    * Add shortcut for `gh repo --delete`
    * Use logged user in `gh user`
* **v1.3.1** September 9, 2013
    * Fix log on `gh repo --new`
    * Add ability to delete a repository
* **v1.3.0** September 8, 2013
    * Add new `gh repo` command
    * Authenticate with GitHub regardless the command is run from a git repo
    * Use last commit message as pull request title instead of branch name
    * Document `gh alias --list`
    * Add `--assignee` flag for issues
    * Fix list issues that are related to a milestone
* **v1.2.2** August 14, 2013
    * Include `--description` attribute on PR submit
* **v1.2.1** August 12, 2013
    * Parse remote url with score on username
    * Add tests using Mocha
* **v1.2.0** June 7, 2013
    * Add ability to create alias for users
    * Add ability to list all issues/pull requests from a certain user
    * Use git remote values instead of logged user and current repo
    * Add ability to login with a different GitHub user with `gh user`
* **v1.1.1** June 6, 2013
    * Bug fixes
* **v1.1.0** June 5, 2013
    * Add `--milestone` filter flag on listing issues
* **v1.0.0** June 4, 2013
    * Rename commands and add shortcut for them
    * Add default action for commands when no flags is passed
* **v0.1.13** June 3, 2013
    * Fixed error using wrong branch name when submitting a pull request
* **v0.1.12** June 3, 2013
    * Enable fetch PRs from private repos
* **v0.1.11** June 2, 2013
    * Add `--label`, `--state` and `--detailed` flags on listing issues
    * Add ability to open/close an Issue
    * Fixed error when running command outside of a Git repo
    * Improve log for listing open and closed pull requests trough `--state` flag
* **v0.1.10** May 30, 2013
    * Cross platform process.env.HOME
* **v0.1.8** May 30, 2013
    * Open issue in browser
    * Open pull request url on the browser after sending it
* **v0.1.7** May 30, 2013
    * Add ability to set number without `--number` flag
* **v0.1.6** May 30, 2013
    * Add ability to specify a title on `gh pr --submit`
    * Add password mask on authentication
    * Bug fixes
* **v0.1.5** May 29, 2013
    * Fix pull request integrity check
* **v0.1.4** May 28, 2013
    * Add ability to create an Issue
    * Add ability to comment on an Issue
    * Rename pull request `--comment` to `--message`
    * Rename pull request `--pull` to `--number`
* **v0.1.3** May 28, 2013
    * Remove mustache dependency
* **v0.1.2** May 28, 2013
    * Removing wrong number on submit
* **v0.1.1** May 27, 2013
    * Add **Help** task
    * Standardize logs
    * Bug fixes
* **v0.1.0** May 26, 2013
  * Allow log handlebars template from string
  * Move apply replacements logic to logger
    * Use handlebars templates instead of strings
    * Refactoring template integration with logger
    * Rename pull request `--comment` to `--message`
    * Add **Issues** task
* **v0.0.7** May 24, 2013
    * Add pull request forward command
    * Add Travis continous integration with JSHint
    * Create a new website under gh-pages branch
    * Update dependency version: git-wrapper@0.1.1
    * Add **Hello World** and **Notification** tasks
* **v0.0.6** May 17, 2013
    * Add ability to merge or rebase pull request
    * Add base.getUser and git.merge helpers
* **v0.0.5** May 16, 2013
    * Add login to be invoked by default in series
* **v0.0.4** May 16, 2013
    * Create ~/.gh.json if needed
* **v0.0.3** May 16, 2013
    * Merge user ~/.gh.json with default .gh.json
    * Add default .gh.json
    * Fix bin path
* **v0.0.2** May 16, 2013
    * Add fetch, open/close, message
    * Use moment humanize utility
* **v0.0.1** May 14, 2013
    * Initial commit

## License

[BSD License](https://github.com/node-gh/gh/blob/master/LICENSE.md)