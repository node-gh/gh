---
title: "Gists"
description: "Open, Create & Fork gists"
layout: "guide"
icon: "bookmark"
weight: 6
---

###### {$page.description}

<article id="1">

```javascript
gh gists
```

#### Alias:

```javascript
gh gi
```

## Open in Browser

Option                 | Usage        | Type
---                    | ---          | ---
`-B`, `--browser`      | **Required** | `Boolean`
`-u`, `--user`         | *Optional*   | `String`
`-i`, `--id`           | *Optional*   | `String`

#### Examples

* **Shortcut** for opening your Gists in the browser.

```shell
gh gi
```

* Open a Gist in the browser.

```shell
gh gi --browser --id 5991877
```

</article>


<article id="2">

## List

Option                 | Usage        | Type
---                    | ---          | ---
`-l`, `--list`         | **Required** | `Boolean`
`-u`, `--user`         | *Optional*   | `String`

#### Examples

* List all gists.

```shell
gh gi --list
```

* List all gists from someone.

```shell
gh gi --list --user brunocoelho
```
</article>


<article id="3">

## Create

Option                | Usage        | Type
---                   | ---          | ---
`-N`, `--new`         | **Required** | `String`
`-c`, `--content`     | *Optional*   | `String`
`-d`, `--description` | *Optional*   | `String`
`-p`, `--private`     | *Optional*   | `Boolean`

#### Examples

* Create a Gist `hello` containing "Hello World".

```shell
gh gi --new hello --content "Hello World!"
```

* Create a private Gist `hello` containing "Hello World".

```shell
gh gi --new hello --content "Hello World!" --private
```
</article>


<article id="4">

## Fork

Option                | Usage        | Type
---                   | ---          | ---
`-f`, `--fork`        | **Required** | `String`

#### Examples

* Fork a Gist.

```shell
gh gi --fork 5444883
```
</article>


<article id="5">

## Delete

Option                | Usage        | Type
---                   | ---          | ---
`-D`, `--delete`      | **Required** | `String`

#### Example

* Delete a Gist.

```shell
gh gi --delete 4252323
```

* Delete multiple Gists.

```shell
gh gi --delete 4252321 --delete 4252322
```
</article>