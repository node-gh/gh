# Node GH

[![NPM version](http://img.shields.io/npm/v/gh.svg?style=flat)](http://npmjs.org/gh)
[![NPM downloads](http://img.shields.io/npm/dm/gh.svg?style=flat)](http://npmjs.org/gh)
[![Build Status](http://img.shields.io/travis/node-gh/gh/master.svg?style=flat)](https://travis-ci.org/node-gh/gh)
[![Dependencies Status](http://img.shields.io/david/node-gh/gh.svg?style=flat)](https://david-dm.org/node-gh/gh)
[![DevDependencies Status](http://img.shields.io/david/dev/node-gh/gh.svg?style=flat)](https://david-dm.org/node-gh/gh#info=devDependencies)

![Class Octocat](http://nodegh.io/images/class-octocat.jpg)

> All the power of GitHub in your terminal.

## Table of contents

* [Install](#install)
* [Usage](#usage)
* [Dependencies](#dependencies)
* [Demonstration](#demonstration)
* [Config](#config)
* [Plugins](#plugins)
* [Tasks](#tasks)
* [Team](#team)
* [Contributing](#contributing)
* [History](#history)
* [License](#license)

## Install

    [sudo] npm install -g gh

## Usage

    gh [command] [payload] [--flags]
    

### List all comands options
```
gh help --all
```


## Dependencies

In order to sucessfully run this project you must have [NodeJS](http://nodejs.org/download/) installed.

## Demonstration

[![Demo](http://nodegh.io/images/nodegh-demo.jpg)](https://asciinema.org/a/3391/)

## Config

There are some pretty useful configurations that you can set on [.gh.json](https://github.com/node-gh/gh/blob/master/.gh.json).
This file can be found under home directory *(on MacOSx: `/Users/yourName/.gh.json` on Windows: `C:\\Users\yourName\.gh.json`)*.

You can also set per-project configurations by adding a `.gh.json` file in your project's root folder and overriding existing keys.

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

## Plugins

* [GH Gif](https://github.com/node-gh/gh-gif) - A plugin for commenting on pull requests/issues using GIF reactions.
* [GH Travis](https://github.com/node-gh/gh-travis) - A plugin for integrating Travis, a continous integration server.
* [GH Jira](https://github.com/node-gh/gh-jira) - A plugin for integrating Jira, an issue management system.

Feel free to create your own plugins by forking [GH Boilerplate](https://github.com/node-gh/gh-boilerplate).

## Tasks

* Bump package version, create tag, commit and push.

    ```
grunt bump       # v0.0.1
grunt bump:minor # v0.1.0
grunt bump:major # v1.0.0
    ```

* Run [JSBeautifier](http://jsbeautifier.org/), a tool to format code.

    ```
grunt format
    ```

* Run [JSHint](http://www.jshint.com/), a tool to detect errors and potential problems.

    ```
grunt lint
    ```

* Run [Mocha](http://visionmedia.github.io/mocha/), a unit test framework.

    ```
grunt test
    ```

* Watch for changes and run `lint` and `test` tasks.

    ```
grunt watch
    ```

* Shortcut for `jshint` and `mochaTest` tasks.

    ```
grunt
    ```

## Team

Node GH is maintained by these guys and some awesome [contributors](https://github.com/node-gh/gh/graphs/contributors).

[![Eduardo Lundgren](http://gravatar.com/avatar/42327de520e674a6d1686845b30778d0?s=70)](https://github.com/eduardolundgren/) | [![Zeno Rocha](http://gravatar.com/avatar/e190023b66e2b8aa73a842b106920c93?s=70)](https://github.com/zenorocha/) | [![Henrique Vicente](http://gravatar.com/avatar/5733fd332f2a0da11931e0e73ddfb20d?s=70)](https://github.com/henvic/) | [![Bruno Coelho](http://gravatar.com/avatar/1f90c690b534779560d3bfdb23772915?s=70)](https://github.com/brunocoelho/)
--- | --- | --- | ---
[Eduardo Lundgren](https://github.com/eduardolundgren/) | [Zeno Rocha](https://github.com/zenorocha/) | [Henrique Vicente](https://github.com/henvic/) | [Bruno Coelho](https://github.com/brunocoelho/)

## Contributing

For detailed instructions, check [Contributing](https://github.com/node-gh/gh/blob/master/CONTRIBUTING.md).

## History

For detailed changelog, check [Releases](https://github.com/node-gh/gh/releases).

## License

[BSD License](https://github.com/node-gh/gh/blob/master/LICENSE.md)
