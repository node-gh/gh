---
title: "Issues"
description: "Create & Modify Github Issues"
layout: "guide"
icon: "hammer"
weight: 3
---

###### {$page.description}

<article id="1">

```javascript
gh issue
```

#### Alias:

```javascript
gh is
```

## Create

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

```shell
gh is 'Node GH rocks!' 'Body with **Markdown** support'
```

* Create a new issue on a certain repository.

```shell
gh is --new --title 'Node GH rocks!' --message 'Body with **Markdown** support' --user eduardolundgren --repo node-gh
```

* Create a new issue with labels.

```shell
gh is --new --title 'Node GH rocks!' --label bug,question,test
```

* Create a new issue and assign it to someone.

```shell
gh is --new --title 'Node GH rocks!' --assignee zenorocha
```

</article>


<article id="2">

## Comment

Option            | Usage        | Type
---               | ---          | ---
`-c`, `--comment` | **Required** | `String`
`-n`, `--number`  | **Required** | `Number`
`--remote`        | *Optional*   | `String`
`-r`, `--repo`    | *Optional*   | `String`
`-u`, `--user`    | *Optional*   | `String`

#### Examples

* Comment on an issue of the current repository.

```shell
gh is 1 --comment 'Node GH rocks!'
```

* Comment on an issue of a certain repository.

```shell
gh is 1 --comment 'Node GH rocks!' --user eduardolundgren --repo node-gh
```

</article>


<article id="3">

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

* Open an issue.

```shell
gh is 1 --open
```
* Close an issue.

```shell
gh is 1 --close
```

* Close multiple issues.

```shell
gh is --close --number 1 --number 2
```

* Open multiple issues.

```shell
gh is --open --number 1 --number 2
```

* Open or close an issue that you've sent to someone.

```shell
gh is 1 --close --user eduardolundgren
```

</article>


<article id="4">

## List

Option             | Usage        | Type
---                | ---          | ---
`-l`, `--list`     | **Required** | `Boolean`
`-a`, `--all`      | *Optional*   | `Boolean`
`-A`, `--assignee` | *Optional*   | `String`
`-d`, `--detailed` | *Optional*   | `Boolean`
`-L`, `--label`    | *Optional*   | `String`
`-M`, `--milestone`| *Optional*   | [`Number`, `String`]
`--remote`         | *Optional*   | `String`
`-r`, `--repo`     | *Optional*   | `String`
`-S`, `--state`    | *Optional*   | [`open`, `closed`]
`-u`, `--user`     | *Optional*   | `String`

#### Examples

* **Shortcut** for listing all issues on the current repository.

```shell
gh is
```

* List all issues from all repositories.

```shell
gh is --list --all
```

* List issues assigned to someone.

```shell
gh is --list --assignee zenorocha
```

* List issues with link and content.

```shell
gh is --list --detailed
```

* List only closed issues on the current repository.

```shell
gh is --list --state closed
```

* List issues filtered by milestone.

```shell
gh is --list --milestone 1
```

* List issues that contains labels `todo` and `bug`.

```shell
gh is --list --label todo,bug
```

* List all issues on a certain repository.

```shell
gh is --list --user eduardolundgren --repo node-gh
```

</article>


<article id="5">

## Open in Browser

Option                 | Usage        | Type
---                    | ---          | ---
`-B`, `--browser`      | **Required** | `Boolean`
`-n`, `--number`       | **Required** | `Number`
`-u`, `--user`         | *Optional*   | `String`
`-r`, `--repo`         | *Optional*   | `String`

#### Examples

* **Shortcut** for opening GitHub issue page in the browser.
```shell
gh is 100
```

* Open GitHub issue page in the browser.

```shell
gh is 100 --browser
```


</article>


<article id="6">

## Search

Option             | Usage        | Type
---                | ---          | ---
`-s`, `--search`   | **Required** | `Boolean`
`-a`, `--all`      | *Optional*   | `Boolean`
`-d`, `--detailed` | *Optional*   | `Boolean`
`-r`, `--repo`     | *Optional*   | `String`
`-u`, `--user`     | *Optional*   | `String`

#### Examples

* Search issues in current repository

```shell
gh is --search 'term'
```

* Search issues in all repositories for a user

```shell
gh is --all --user node-gh --search 'term'
```

* Search issues in a repository for a user

```shell
gh is  --user node-gh --repo gh --search 'term'
```

* Search issues in a repository for a user with link and content

```shell
gh is  --user node-gh --repo gh --search 'term'
```

* Search issues with github filters

```shell
gh is  --user node-gh --repo gh --search 'updated:<=2013-05-24'
```

</article>


<article id="7">

## Assign

Option            | Usage        | Type
---               | ---          | ---
`--assign`        | **Required** | `Boolean`
`-A`, `--assignee`| **Required** | `String`
`-n`, `--number`  | **Required** | `Number`
`-r`, `--repo`    | *Optional*   | `String`
`-u`, `--user`    | *Optional*   | `String`

#### Examples

* Assign an issue on the current repository to a user.

```shell
gh is --assign --assignee zenorocha --number 1
```

* Assign an issue on a specific repository to a user.

```shell
gh is --assign --assignee zenorocha --number 1 --user eduardolundgren --repo gh
```

</article>
