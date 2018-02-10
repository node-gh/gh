---
title: "Repos"
description: "Open, List, Create & Clone Repos"
layout: "guide"
icon: "cloud"
weight: 5
---

###### {$page.description}

<article id="1">

```javascript
gh repo
```

#### Alias:

```javascript
gh re
```

## Open in Browser

Option                 | Usage        | Type
---                    | ---          | ---
`-B`, `--browser`      | **Required** | `Boolean`
`-u`, `--user`         | *Optional*   | `String`
`-r`, `--repo`         | *Optional*   | `String`

#### Examples

* **Shortcut** for opening the GitHub repository page in the browser.

```shell
gh re
```

* Open GitHub repository page in the browser.

```shell
gh re --browser --user eduardolundgren --repo node-gh
```

</article>


<article id="2">

## List

Option                 | Usage        | Type
---                    | ---          | ---
`-l`, `--list`         | **Required** | `Boolean`
`-d`, `--detailed`     | *Optional*   | `Boolean`
`-u`, `--user`         | *Optional*   | `String`
`-t`, `--type`         | *Optional*   | [`all`, `owner`, `public`, `private`, `member`]

#### Examples

* List all repositories.

```shell
gh re --list
```

* List all private repositories.

```shell
gh re --list --type private
```

* List all repositories from someone.

```shell
gh re --list --user zenorocha
```

</article>


<article id="3">

## Create

Option                | Usage        | Type
---                   | ---          | ---
`-N`, `--new`         | **Required** | `String`
`-O`, `--organization`| *Optional*   | `String`
`-c`, `--clone`       | *Optional*   | `Boolean`
`-t`, `--type`        | *Optional*   | [`private`]
`--init`              | *Optional*   | `Boolean`
`--gitignore`         | *Optional*   | `String`
`--homepage`          | *Optional*   | `String`
`--description`       | *Optional*   | `String`

#### Examples

* Create a new GitHub repository and clone on the current directory.

```shell
gh re --new foo --clone
```

* Create a new GitHub repository for an organization.

```shell
gh re --new foo --organization node-gh
```

* Create a new GitHub repository using .gitignore template for Ruby.

```shell
gh re --new gemified --gitignore Ruby
```

* Create a new private repository on GitHub, initializing it with a initial commit of the README.

```shell
gh re --new foo --init --type private
```
</article>


<article id="4">

## Fork

Option                | Usage        | Type
---                   | ---          | ---
`-f`, `--fork`        | **Required** | `String`
`-u`, `--user`        | **Required** | `String`
`-O`, `--organization`| *Optional*   | `String`

#### Examples

* Fork a GitHub repository.

```shell
gh re --fork repo --user user
```

* Fork a GitHub repository into the node-gh organization.

```shell
gh re --fork repo --user user --organization node-gh
```
</article>


<article id="5">

## Delete

Option                | Usage        | Type
---                   | ---          | ---
`-D`, `--delete`      | **Required** | `String`
`-u`, `--user`        | **Required** | `String`

#### Example

* Delete a repository of the logged user.

```shell
gh re --delete foo
```
</article>


<article id="6">

## Clone

Option                | Usage        | Type
---                   | ---          | ---
`-c`, `--clone`       | **Required** | `String`
`-r`, `--repo`        | **Required** | `String`
`-O`, `--organization`| *Optional*   | `String`
`-P`, `--protocol`    | *Optional*   | `String`
`-u`, `--user`        | *Optional*   | `String`

#### Examples

* Clone a repository.

```shell
gh re --clone --repo gh
```

* Clone a repository from a specific user using HTTPS protocol.

```shell
gh re --clone --user eduardolundgren --repo gh --protocol https
```
</article>


<article id="7">

## Create Label

Option                | Usage        | Type
---                   | ---          | ---
`-C`, `--color`       | **Required** | `String`
`-L`, `--label`       | **Required** | `Boolean`
`-N`, `--new`         | **Required** | `String`
`-r`, `--repo`        | **Required** | `String`
`-O`, `--organization`| *Optional*   | `String`
`-u`, `--user`        | *Optional*   | `String`

#### Examples

* Create a label for a repository.

```shell
gh re --label --new bug --color color --repo gh
```

* Create a label for a user's repository.

```shell
gh re --label --new bug --color color --user eduardolundgren --repo gh
```
</article>


<article id="8">

## Delete Label

Option                | Usage        | Type
---                   | ---          | ---
`-L`, `--label`       | **Required** | `Boolean`
`-D`, `--delete`      | **Required** | `String`
`-r`, `--repo`        | **Required** | `String`
`-O`, `--organization`| *Optional*   | `String`
`-u`, `--user`        | *Optional*   | `String`

#### Examples

* Delete a label from a repository.

```shell
gh re --label --delete bug --repo gh
```

* Delete a label from a user's repository.

```shell
gh re --label --delete bug --user eduardolundgren --repo gh
```

</article>


<article id="9">

## List Labels

Option                | Usage        | Type
---                   | ---          | ---
`-L`, `--label`       | **Required** | `Boolean`
`-l`, `--list`        | **Required** | `Boolean`
`-r`, `--repo`        | **Required** | `String`
`-O`, `--organization`| *Optional*   | `String`
`-u`, `--user`        | *Optional*   | `String`

#### Examples

* List labels for a repository.

```shell
gh re --label --list --repo gh
```

* List labels for a user's repository.

```shell
gh re --label --list --user eduardolundgren --repo gh
```
</article>


<article id="10">

## Update Label

Option                | Usage        | Type
---                   | ---          | ---
`-C`, `--color`       | **Required** | `String`
`-L`, `--label`       | **Required** | `Boolean`
`-r`, `--repo`        | **Required** | `String`
`-U`, `--update`      | **Required** | `String`
`-O`, `--organization`| *Optional*   | `String`
`-u`, `--user`        | *Optional*   | `String`

#### Examples

* Update a label for a repository.

```shell
gh re --label --update bug --color color --repo gh
```

* Update a label for a user's repository.

```shell
gh re --label --update bug --color color --user eduardolundgren --repo gh
```
</article>