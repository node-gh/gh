# Node GH [![Build Status](https://secure.travis-ci.org/node-gh/gh.png?branch=master)](https://travis-ci.org/node-gh/gh) [![NPM version](https://badge.fury.io/js/gh.png)](http://badge.fury.io/js/gh) [![Dependency Status](https://david-dm.org/node-gh/gh.png)](https://david-dm.org/node-gh/gh) [![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/node-gh/gh/trend.png)](https://bitdeli.com/free)

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
    * [Gists](#gists)
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

* List all comands options.

    ```
gh help --all
    ```

* List specific command options.

    ```
gh help <command>
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
`-N`, `--new`         | **Required** | `String`
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
gh re --fork repo --user user
    ```

* Fork a GitHub repository into the node-gh organization.

    ```
gh re --fork repo --user user --organization node-gh
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

## Gists

```
gh gists
```

> **Alias:** `gh gi`

### 1. Open in Browser

Option                 | Usage        | Type
---                    | ---          | ---
`-B`, `--browser`      | **Required** | `Boolean`
`-u`, `--user`         | *Optional*   | `String`
`-i`, `--id`           | *Optional*   | `String`

#### Examples

* **Shortcut** for opening your Gists in the browser.

    ```
gh gi
    ```

* Open a Gist in the browser.

    ```
gh gi --browser --id 5991877
    ```

### 2. Create

Option                | Usage        | Type
---                   | ---          | ---
`-N`, `--new`         | **Required** | `String`
`-c`, `--content`     | *Optional*   | `String`
`-d`, `--description` | *Optional*   | `String`
`-p`, `--private`     | *Optional*   | `Boolean`
`-P`, `--paste`       | *Optional*   | `Boolean`

#### Examples

* Create a Gist `foo.js` pasting the contents of your clipboard.

    ```
gh gi --new foo.js --paste
    ```

* Create a Gist `hello` containing "Hello World".

    ```
gh gi --new hello --content "Hello World!"
    ```

* Create a private Gist `hello` containing "Hello World".

    ```
gh gi --new hello --content "Hello World!" --private
    ```


### 3. Fork

Option                | Usage        | Type
---                   | ---          | ---
`-f`, `--fork`        | **Required** | `String`

#### Examples

* Fork a Gist.

    ```
gh gi --fork 5444883
    ```


### 4. Delete

Option                | Usage        | Type
---                   | ---          | ---
`-D`, `--delete`      | **Required** | `String`

#### Example

* Delete a Gist.

    ```
gh gi --delete 4252323
    ```

* Delete multiple Gists.

    ```
gh gi --delete 4252321 --delete 4252322
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

* GitHub API configurations. Change it if you're a [GitHub Enterprise](https://enterprise.github.com/) user.

    ```javascript
"api": {
    "host": "api.github.com",
    "protocol": "https",
    "version": "3.0.0"
}
    ```

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

* Run automated tasks passing arguments to the commands. Required for prompt commands.

    ```javascript
"hooks": {
        "pull-request": {
            "merge": {
                "before": [{"cmd": "foo", "args": ["bar", "qux"]}]
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
* [GH Jira](https://github.com/node-gh/gh-jira) - A plugin for integrating Jira, an issue management system.

Feel free to create your own plugins by forking [GH Boilerplate](https://github.com/node-gh/gh-boilerplate).

## Testing

* Check [Travis](https://travis-ci.org/node-gh/gh) for continous integration results. Or run to preview the travis status.

    ```
grunt travis
    ```

* Run [JSHint](http://www.jshint.com/), a tool to detect errors and potential problems.

    ```
grunt jshint
    ```

* Run [Mocha](http://visionmedia.github.io/mocha/), a unit test framework.

    ```
grunt mochaTest
    ```

## Team

Node GH is maintained by these guys and some awesome [contributors](https://github.com/node-gh/gh/graphs/contributors).

[![Eduardo Lundgren](http://gravatar.com/avatar/42327de520e674a6d1686845b30778d0?s=70)](https://github.com/eduardolundgren/) | [![Zeno Rocha](http://gravatar.com/avatar/e190023b66e2b8aa73a842b106920c93?s=70)](https://github.com/zenorocha/)
--- | ---
[Eduardo Lundgren](https://github.com/eduardolundgren/) | [Zeno Rocha](https://github.com/zenorocha/)

## Contributing

Contribute new commands to this project by copying and editing the content of [Hello World](https://github.com/node-gh/gh/blob/master/lib/cmds/hello.js) example.

## History

Check [Release](https://github.com/node-gh/gh/releases) list.

## License

[BSD License](https://github.com/node-gh/gh/blob/master/LICENSE.md)
