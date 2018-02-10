---
title: "Alias"
description: "Create Shortcut Aliases For Things Like Usernames & Repositories"
layout: "guide"
icon: "flash"
weight: 7
---

###### {$page.description}

<article id="1">

```javascript
gh alias
```

#### Alias:

```javascript
gh al
```

## List

Option            | Usage        | Type
---               | ---          | ---
`-l`, `--list`    | **Required** | `Boolean`

#### Examples

* **Shortcut** for listing aliases.

```shell
gh alias
```

* List aliases.

```shell
gh alias --list
```
</article>


<article id="2">

## Add

Option            | Usage        | Type
---               | ---          | ---
`-a`, `--add`     | **Required** | `String`
`-u`, `--user`    | **Required** | `String`

#### Examples

* Create alias for username.

```shell
gh alias --add zeno --user zenorocha
```


</article>


<article id="3">

## Remove

Option            | Usage        | Type
---               | ---          | ---
`-r`, `--remove`  | **Required** | `String`

#### Examples

* Remove alias.

```shell
gh alias --remove zeno
```
</article>
