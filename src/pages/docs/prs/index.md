---
title: "Pull Requests"
description: "The Greatest Power Of Node GH Lies In Its Ability To Interface With Github's Pull Request Api, So This Is A Great Place To Start!"
layout: "guide"
icon: "code-file"
weight: 2
---

###### {$page.description}

<article id="1">

```javascript
gh pull-request
```

#### Alias:

```javascript
gh pr
```

## Submit
Option                  | Usage        | Type
---                     | ---          | ---
`-s`, `--submit`        | **Required** | `String`
`-b`, `--branch`        | *Optional*   | `String`
`-D`, `--description`   | *Optional*   | `String`
`-i`, `--issue`         | *Optional*   | `Number`
`-r`, `--repo`          | *Optional*   | `String`
`-t`, `--title`         | *Optional*   | `String`

Omitting a value for `--submit` fallbacks to the `default_pr_reviewer` key found
in your [config file](#config). Omitting `--title` will submit a pull request
using the last commit message as title.

#### Examples

* Submit a pull request using the current branch.

```shell
gh pr --submit eduardolundgren --title 'Fix #32' --description 'Awesome fix'
```

* Submit a pull request using the current branch to dev branch.

```shell
gh pr --submit eduardolundgren --branch dev
```

* Submit a pull request from a issue.

```shell
gh pr --submit eduardolundgren --issue 150
```

</article>

<article id="2">

## Forward

Option           | Usage        | Type
---              | ---          | ---
`--fwd`          | **Required** | `String`
`-n`, `--number` | **Required** | `Number`

Omitting a value for `--fwd` fallbacks to the `default_pr_forwarder` key found
in your [config file](#config).

#### Examples

* Forward a pull request to another reviewer.

```shell
gh pr 1 --fwd username
```

</article>

<article id="3">

## Merge or rebase

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

```shell
gh pr 1 --fetch --merge
```

```shell
gh pr 1 --fetch --rebase
```

* Merge or rebase pull request into branch `dev`.

```shell
gh pr 1 --fetch --rebase --branch dev
```

```shell
gh pr 1 --fetch --merge --branch dev
```

</article>


<article id="4">

## Fetch

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

* **Shortcut** for fetching pull request and checkout into a new branch `pr-1`.

```shell
gh pr 1
```

* Fech pull request rebasing or merging into the current branch.

```shell
gh pr 1 --fetch --rebase
```
```shell
gh pr 1 --fetch --merge
```
</article>


<article id="6">

## List

Option            | Usage        | Type
---               | ---          | ---
`-l`, `--list`    | **Required** | `Boolean`
`-a`, `--all`     | *Optional*   | `Boolean`
`-O`, `--org`     | *Optional*   | `String`
`-m`, `--me`      | *Optional*   | `Boolean`
`-d`, `--detailed`| *Optional*   | `Boolean`
`--direction`     | *Optional*   | [`asc`, `desc`]
`-b`, `--branch`  | *Optional*   | `String`
`--remote`        | *Optional*   | `String`
`-r`, `--repo`    | *Optional*   | `String`
`--sort`          | *Optional*   | [`created`, `updated`, `popularity`, `long-running`, `complexity`]
`-S`, `--state`   | *Optional*   | [`open`, `closed`]
`-u`, `--user`    | *Optional*   | `String`

#### Examples

* **Shortcut** for listing open pull requests for the current repository.

```shell
gh pr
```

* Get information about a pull request.

```shell
gh pr --info number
```

* List open pull requests for all branches from all your repositories.

```shell
gh pr --list --all
```

* List open pull requests for all branches in all repositories belonging to the "github" organization.

```shell
gh pr --list --all --org github
```

* List open pull requests sent by logged user on current repository.

```shell
gh pr --list --me
```

* List open pull requests with link and content.

```shell
gh pr --list --detailed
```

* List open pull requests for a branch.

```shell
gh pr --list --branch master
```

* List open pull requests and sort them by popularity *(comment count)*.

```shell
gh pr --list --sort popularity
```

* List open pull requests and sort them by asc long-running *(old but still active)*.

```shell
gh pr --list --sort long-running --direction asc
```

* List open pull requests and sort them by complexity *(complexity is calculated based on number of additions, deletions, changed files, comments and review comments)*.

```shell
gh pr --list --sort complexity
```

</article>


<article id="7">

## Info

Option            | Usage        | Type
---               | ---          | ---
`-u`, `--user`    | *Required*   | `String`
`-I`, `--info`    | *Required*   | `Boolean`
`-n`, `--number`  | *Required*   | `String`
`-r`, `--repo`    | *Optional*   | `String`
`-u`, `--user`    | *Optional*   | `String`

</article>


<article id="8">

## Open or close

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

```shell
gh pr 1 --open
```
* Close a pull request.

```shell
gh pr 1 --close
```

* Close multiple pull requests.

```shell
gh pr --close --number 1 --number 2
```

* Open multiple pull requests.

```shell
gh pr --open --number 1 --number 2
```

* Open or close a pull request that you've sent to someone.

```shell
gh pr 1 --close --user eduardolundgren
```
</article>


<article id="9">

## Open in Browser

Option                 | Usage        | Type
---                    | ---          | ---
`-B`, `--browser`      | **Required** | `Boolean`
`-n`, `--number`       | **Required** | `Number`
`-u`, `--user`         | *Optional*   | `String`
`-r`, `--repo`         | *Optional*   | `String`

#### Examples

* Open GitHub pull request page in the browser.

```shell
gh pr 100 --browser
```
</article>