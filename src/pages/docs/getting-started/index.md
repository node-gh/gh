---
title: "Getting Started"
description: "Quick Steps To Getting Started Fast With Node GH"
layout: "guide"
icon: "command-line"
weight: 1
---

###### {$page.description}

<article id="1">

## Install

```javascript
[sudo] npm install -g gh
```

</article>


<article id="2">

## Usage

```javascript
gh [command] [payload] [--flags]
```

#### Dependencies

In order to sucessfully run this project you must have [NodeJS >= v0.12.0](http://nodejs.org/dist/v0.12.0/) installed.
</article>


<article id="3">

## Global flags

Option            | Usage        | Type
---               | ---          | ---
`--verbose`    | *Optional*   | `Boolean`
`--insane`     | *Optional*   | `Boolean`
`--no-hooks`    | *Optional*   | `Boolean`

The verbose flag is useful for debugging issues.
The insane flag is a more complete verbose flag, which leaks more privacy sensitive data by default.
</article>


<article id="4">

## Getting Help

```shell
gh help
```

* List all comands options.

```shell
gh help --all
```

* List specific command options.

```shell
gh help <command>
```
</article>


<article id="5">

## Config

There are some pretty useful configurations that you can set on [.gh.json](https://github.com/node-gh/gh/blob/master/default.gh.json).
This file can be found under home directory *(on MacOSx: `/Users/yourName/.gh.json` on Windows: `C:\\Users\yourName\.gh.json`)*.

You can also set per-project configurations by adding a `.gh.json` file in your project's root folder and overriding existing keys.

* GitHub API configurations. Change it if you're a [GitHub Enterprise](https://enterprise.github.com/) user.

```javascript
"api": {
    "host": "api.github.com",
    "protocol": "https",
    "version": "3.0.0",
    "pathPrefix": null
}
```

* Set default branch and remote.

```javascript
"default_branch": "master",
"default_remote": "origin"
```

* Set default users when [submitting](#7-submit) or [forwarding](#5-forward) pull requests.

```javascript
"default_pr_forwarder": "",
"default_pr_reviewer": ""
```

* GitHub data filled once you log in.

```javascript
"github_token": "",
"github_user": ""
```

* Run automated tasks before or after a certain command.

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

If you need to use a custom git command, set the environment variable `GH_GIT_COMMAND`.
</article>


<article id="demo">

## Demonstration

<script src="https://asciinema.org/a/3391.js" id="asciicast-3391" async></script>
</article>