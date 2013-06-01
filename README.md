# node-gh [![Build Status](https://secure.travis-ci.org/eduardolundgren/node-gh.png?branch=master)](https://travis-ci.org/eduardolundgren/node-gh) [![NPM version](https://badge.fury.io/js/gh.png)](http://badge.fury.io/js/gh)

![Class Octocat](http://eduardolundgren.github.io/node-gh/images/class-octocat.jpg)

> All the power of GitHub in your terminal.

## Usage

    gh  [command] [--flags]

## Install

    [sudo] npm install -g gh

## Dependencies

In order to sucessfully run this project you must have [NodeJS](http://nodejs.org/download/) installed.

## Available commands

```
gh help
```

## Pull requests

### 1. List

Option           | Usage        | Type
---              | ---          | ---
`-l`, `--list`   | **Required** | `Boolean`
`-a`, `--all`    | *Optional*   | `Boolean`
`-b`, `--branch` | *Optional*   | `String`
`-r`, `--repo`   | *Optional*   | `String`
`-s`, `--user`   | *Optional*   | `String`

#### Examples

* List open pulls requests for the current branch.

    ```
gh pr --list
    ```

* List open pulls requests for all branches.

    ```
gh pr --list --all
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
`-r`, `--repo`   | *Optional*   | `String`
`-s`, `--user`   | *Optional*   | `String`

#### Examples

* Fetch pull request and checkout into a new branch `pull-1`.

    ```
gh pr --number 1 --fetch
    ```

* Fech pull request rebasing or merging into the current branch.

    ```
gh pr --number 1 --fetch --rebase
    ```
    ```
gh pr --number 1 --fetch --merge
    ```

### 3. Merge or rebase

Option           | Usage        | Type
---              | ---          | ---
`-M`, `--merge`  | **Required** | `Boolean`
`-R`, `--rebase` | **Required** | `Boolean`
`-n`, `--number` | *Optional*   | `Number`
`-b`, `--branch` | *Optional*   | `String`
`-r`, `--repo`   | *Optional*   | `String`
`-s`, `--user`   | *Optional*   | `String`

Omitting `--number` will try to guess the pull number from branch name e.g. `pull-1` results in `--number 1`. Omitting `--branch` will merge or rebase into `config.default_branch`.

#### Examples

* Merge or rebase pull request into a branch.

    ```
gh pr --merge [--number 1] [--branch master]
    ```

    ```
gh pr --rebase [--number 1] [--branch master]
    ```

### 4. Comment

Option           | Usage        | Type
---              | ---          | ---
`-c`, `--comment`| **Required** | `String`
`-n`, `--number` | **Required** | `Number`
`-r`, `--repo`   | *Optional*   | `String`
`-s`, `--user`   | *Optional*   | `String`

#### Examples

* Comment on a pull request.

    ```
gh pr --number 1 --comment "Merged, thank you!"
    ```

### 5. Forward

Option           | Usage        | Type
---              | ---          | ---
`--fwd`          | **Required** | `String`
`-n`, `--number` | **Required** | `Number`

#### Examples

* Forward a pull request to another reviewer.

    ```
gh pr --number 1 --fwd username
    ```

### 6. Open or close

Option           | Usage        | Type
---              | ---          | ---
`-o`, `--open`   | **Required** | `Boolean`
`-C`, `--close`  | **Required** | `Boolean`
`-n`, `--number` | **Required** | `Number`
`-r`, `--repo`   | *Optional*   | `String`
`-s`, `--user`   | *Optional*   | `String`

#### Examples

* Open a pull request.

    ```
gh pr --number 1 --open
    ```
* Close a pull request.

    ```
gh pr --number 1 --close
    ```

* Open or close a pull request that you've sent to someone.

    ```
gh pr --number 1 --close --user eduardolundgren
    ```

### 7. Submit

Option           | Usage        | Type
---              | ---          | ---
`-s`, `--submit` | **Required** | `String`
`-b`, `--branch` | *Optional*   | `String`
`-t`, `--title`  | *Optional*   | `String`

Omitting `--title` will submit a pull request using current branch name as title.

#### Examples

* Submit a pull request using the current branch.

    ```
gh pr --submit eduardolundgren --title 'Fix #32'
    ```

* Submit a pull request using the current branch to dev branch.

    ```
gh pr --submit eduardolundgren --branch dev
    ```

## Notifications

### 1. Latest

Option           | Usage        | Type
---              | ---          | ---
`-l`, `--latest` | **Required** | `Boolean`
`-r`, `--repo`   | *Optional*   | `String`
`-s`, `--user`   | *Optional*   | `String`

#### Examples

* Display the latest activities on the current repository.

    ```
gh nt --latest
    ```

* Display the latest activities on a certain repository.

    ```
gh nt --latest --user eduardolundgren --repo node-gh
    ```

### 2. Watch

Option           | Usage        | Type
---              | ---          | ---
`-w`, `--watch`  | **Required** | `Boolean`
`-r`, `--repo`   | *Optional*   | `String`
`-s`, `--user`   | *Optional*   | `String`

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

### 1. Create

Option            | Usage        | Type
---               | ---          | ---
`-N`, `--new`     | **Required** | `Boolean`
`-t`, `--title`   | **Required** | `String`
`-L`, `--label`   | *Optional*   | `String`
`-m`, `--message` | *Optional*   | `String`
`-r`, `--repo`    | *Optional*   | `String`
`-u`, `--user`    | *Optional*   | `String`

#### Examples

* Create a new issue on the current repository.

    ```
gh is --new --title 'Node GH rocks!' --message '**Markdown** support'
    ```

* Create a new issue on a certain repository.

    ```
gh is --new --title 'Node GH rocks!' --message '**Markdown** support' --user eduardolundgren --repo node-gh
    ```

* Create a new issue with labels.

    ```
gh is --new --title 'Node GH rocks!' --label bug,question,test
    ```

### 2. Comment

Option            | Usage        | Type
---               | ---          | ---
`-c`, `--comment` | **Required** | `String`
`-n`, `--number`  | **Required** | `Number`
`-r`, `--repo`    | *Optional*   | `String`
`-u`, `--user`    | *Optional*   | `String`

#### Examples

* Comment on an issue of the current repository.

    ```
gh is --number 1 --comment 'Node GH rocks!'
    ```

* Comment on an issue of a certain repository.

    ```
gh is --number 1 --comment 'Node GH rocks!' --user eduardolundgren --repo node-gh
    ```

### 3. List

Option            | Usage        | Type
---               | ---          | ---
`-l`, `--list`    | **Required** | `Boolean`
`-a`, `--all`     | *Optional*   | `String`
`-r`, `--repo`    | *Optional*   | `String`
`-u`, `--user`    | *Optional*   | `String`

#### Examples

* List all issues on the current repository.

    ```
gh is --list
    ```

* List all issues from all repositories.

    ```
gh is --list --all
    ```

* List all issues on a certain repository.

    ```
gh is --list --user eduardolundgren --repo node-gh
    ```

## Team

[![Eduardo Lundgren](http://gravatar.com/avatar/42327de520e674a6d1686845b30778d0?s=70)](https://github.com/eduardolundgren/) | [![Zeno Rocha](http://gravatar.com/avatar/e190023b66e2b8aa73a842b106920c93?s=70)](https://github.com/zenorocha/)
--- | ---
[Eduardo Lundgren](https://github.com/eduardolundgren/) | [Zeno Rocha](https://github.com/zenorocha/)

## Contributing

Contribute new commands to this project by copying and editing the content of [Hello World](https://github.com/eduardolundgren/node-gh/blob/master/lib/cmds/hello.js) example.

## History

* **v0.1.10** May 30, 2013

    * Cross platform process.env.HOME

* **v0.1.8** May 30, 2013

    * Open issue in browser
    * Open pull request url on the browser after sending it

* **v0.1.7** May 30, 2013
    * Add hability to set number without `--number` flag

* **v0.1.6** May 30, 2013
    * Add the hability to specify a title on `gh pr --submit`
    * Add password mask on authentication
    * Bug fixes
* **v0.1.5** May 29, 2013
    * Fix pull request integrity check
* **v0.1.4** May 28, 2013
    * Add the hability to create an Issue
    * Add the hability to comment on an Issue
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
    * Add hability to merge or rebase pull request
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

[BSD License](https://github.com/eduardolundgren/node-gh/blob/master/README.md)