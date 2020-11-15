# DEPRECATED

---

<h1 align="center">Node GH</h1>

<p align="center">
    <a href="#contributors" alt="All Contributors Badge">
      <img src="https://img.shields.io/badge/all_contributors-88-orange.svg?style=flat-square" />
    </a>
    <a href="http://npmjs.org/gh" alt="NPM version Badge">
      <img src="http://img.shields.io/npm/v/gh.svg?style=flat" />
    </a>
    <a href="https://travis-ci.org/node-gh/gh" alt="Build Status Badge">
      <img src="http://img.shields.io/travis/node-gh/gh/master.svg?style=flat" />
    </a>
    <a href="https://snyk.io/test/github/node-gh/gh" alt="Known Vulnerabilities Badge">
      <img src="https://snyk.io/test/github/node-gh/gh/badge.svg" />
    </a>
    <a href="https://github.com/semantic-release/semantic-release" alt="Semantic Release Badge">
      <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" />
    </a>
    <a href="https://lgtm.com/projects/g/node-gh/gh/context:javascript" alt="LGTM Grade Badge">
      <img src="https://img.shields.io/lgtm/grade/javascript/g/node-gh/gh.svg?logo=lgtm&logoWidth=18" />
    </a>
    <a href="https://lgtm.com/projects/g/node-gh/gh/alerts" alt="LGTM Total Alerts Badge">
      <img src="https://img.shields.io/lgtm/alerts/g/node-gh/gh.svg?logo=lgtm&logoWidth=18" />
    </a>
</p>

> Boost your productivity & automate tasks when working with GitHub, all from the comfort of your CLI.

## Table of contents

[Contributors](#contributors)

<details><summary>Getting Started</summary>

-   [Install](#install)
-   [Usage](#usage)
-   [Config](#config)
-   [Plugins](#plugins)
-   [Contributing](#contributing)
    </details>

<details><summary>Available Commands</summary><br/>

<details><summary>Pull Requests `pr`</summary>

-   [`--info` - Get information about a pull request](#pr-info)
-   [`--list` - List pull requests](#pr-list)
-   [`--fetch` - Rebase or Merge pull request into new branch](#pr-merge-or-rebase)
-   [`--comment` - Comment on a pull request](#pr-comment)
-   [`--fwd` - Forward a pull request to another reviewer](#pr-forward)
-   [`--open` | `--close` - Open or Close a pull request](#pr-open-or-close)
-   [`--submit` - Open or Close a pull request](#pr-submit)
-   [`--browser` - Open GitHub pull request page in the browser](#pr-open-in-browser)
    </details>

<details><summary>Issues `is`</summary>

-   [`--new` - Create new issues](#issue-create)
-   [`--comment` - Comment on an issue of a repository](#issue-comment)
-   [`--list` - List issues on a repository](#issue-list)
-   [`--open` | `--close` - Open or Close an issue](#issue-open-or-close)
-   [`--browser` - Open GitHub issue page in the browser](#issue-open-in-browser)
-   [`--lock` - Lock GitHub issue](#issue-lock)
-   [`--search` - Search issues in current repository](#issue-search)
-   [`--assign` - Assign an issue on a repository to a user](#issue-assign)
    </details>

<details><summary>Repos `re`</summary>

-   [`--browser` - Open the GitHub repository page in the browser](#repo-open-in-browser)
-   [`--list` - List repos](#repo-list)
-   [`--create` - Create a new GitHub repository and clone on the current directory](#repo-create)
-   [`--fork` - Fork a GitHub repository](#repo-fork)
-   [`--delete` - Delete a repository of specified user](#repo-delete)
-   [`--clone` - Clone a repository](#repo-clone)
-   [`--label --new` - Create or delete a label for a repository](#repo-create-label)
-   [`--label --delete` - Delete a label for a repository](#repo-delete-label)
-   [`--label --list` - List labels for a repository](#repo-list-label)
-   [`--label --update` - Update a label for a repository](#repo-list-labels)
-   [`--search` - Find repositories via various criteria](#repo-search)
    </details>

<details><summary>Gists `gi`</summary>

-   [`--browser` - Open a Gist in the browser](#gist-open-in-browser)
-   [`--list` - List user's gists](#gist-list)
-   [`--create` - Create new gists](#gist-create)
-   [`--fork` - Fork a gist](#gist-fork)
-   [`--delete` - Delete a gist](#gist-delete)
    </details>

<details><summary>User `us`</summary>

-   [`--login` - Automates saving user name & developer token credentials to your ~/.gh.json config](#user-login-or-logout)
-   [`--logout` - Automates removing user name & developer token credentials from your ~/.gh.json config](#user-login-or-logout)
-   [`--whoami` - Prints the user name from ~/.gh.json to your console](#user-whoami)
    </details>

<details><summary>Notifications `nt`</summary>

-   [`--latest` - Display the latest activities on a repository](#notifications-latest)
-   [`--list` - Watch for any activity on repository](#notifications-watch)
    </details>

<details><summary>Milestones `ms`</summary>

-   [`--list` - List milestones for a specific repo](#milestone-list)
    </details>

<details><summary>Alias `al`</summary>

-   [`--add` - Add a shell-like alias for users](#alias-add)
-   [`--remove` - Remove alias](#alias-remove)
-   [`--list` - List aliases for a specific repo](#alias-list)
    </details>

<br/>
</details>

<details><summary>General</summary>

-   [History](#history)
-   [License](#license)
-   [Demonstration](#demonstration)
-   [Supported Node Versions](#supported-node-versions)
    </details>

## Install

```
npm install -g gh
```

## Usage

-   Most commands require you to use a developer key
-   We automate the process for you the first time you run a command
-   [Instructions](#user-login-or-logout) on manually adding a developer key for extra security

Simple example: _list prs for current repo_

```
gh pr
```

## Contributors

Huge thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/eduardolundgren"><img src="https://avatars0.githubusercontent.com/u/113087?v=4" width="50px;" alt=""/><br /><sub><b>Eduardo Lundgren</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=eduardolundgren" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Aeduardolundgren" title="Bug reports">🐛</a> <a href="https://github.com/node-gh/gh/commits?author=eduardolundgren" title="Documentation">📖</a> <a href="#question-eduardolundgren" title="Answering Questions">💬</a> <a href="#infra-eduardolundgren" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#plugin-eduardolundgren" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/node-gh/gh/commits?author=eduardolundgren" title="Tests">⚠️</a> <a href="https://github.com/node-gh/gh/pulls?q=is%3Apr+reviewed-by%3Aeduardolundgren" title="Reviewed Pull Requests">👀</a> <a href="#ideas-eduardolundgren" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://zenorocha.com"><img src="https://avatars1.githubusercontent.com/u/398893?v=4" width="50px;" alt=""/><br /><sub><b>Zeno Rocha</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=zenorocha" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Azenorocha" title="Bug reports">🐛</a> <a href="https://github.com/node-gh/gh/commits?author=zenorocha" title="Documentation">📖</a> <a href="#question-zenorocha" title="Answering Questions">💬</a> <a href="#infra-zenorocha" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#plugin-zenorocha" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/node-gh/gh/commits?author=zenorocha" title="Tests">⚠️</a> <a href="https://github.com/node-gh/gh/pulls?q=is%3Apr+reviewed-by%3Azenorocha" title="Reviewed Pull Requests">👀</a> <a href="#ideas-zenorocha" title="Ideas, Planning, & Feedback">🤔</a> <a href="#content-zenorocha" title="Content">🖋</a></td>
    <td align="center"><a href="https://henvic.github.io/"><img src="https://avatars3.githubusercontent.com/u/936421?v=4" width="50px;" alt=""/><br /><sub><b>Henrique Vicente</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=henvic" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Ahenvic" title="Bug reports">🐛</a> <a href="#question-henvic" title="Answering Questions">💬</a> <a href="#infra-henvic" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#plugin-henvic" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/node-gh/gh/commits?author=henvic" title="Tests">⚠️</a> <a href="https://github.com/node-gh/gh/pulls?q=is%3Apr+reviewed-by%3Ahenvic" title="Reviewed Pull Requests">👀</a> <a href="#security-henvic" title="Security">🛡️</a> <a href="#ideas-henvic" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/protoEvangelion"><img src="https://avatars3.githubusercontent.com/u/20076677?v=4" width="50px;" alt=""/><br /><sub><b>Ryan Garant</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3AprotoEvangelion" title="Bug reports">🐛</a> <a href="#question-protoEvangelion" title="Answering Questions">💬</a> <a href="#infra-protoEvangelion" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#plugin-protoEvangelion" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/node-gh/gh/commits?author=protoEvangelion" title="Tests">⚠️</a> <a href="https://github.com/node-gh/gh/pulls?q=is%3Apr+reviewed-by%3AprotoEvangelion" title="Reviewed Pull Requests">👀</a> <a href="#security-protoEvangelion" title="Security">🛡️</a> <a href="#ideas-protoEvangelion" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/brunocoelho"><img src="https://avatars1.githubusercontent.com/u/827445?v=4" width="50px;" alt=""/><br /><sub><b>Bruno Coelho</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=brunocoelho" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Abrunocoelho" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.joyent.com/"><img src="https://avatars1.githubusercontent.com/u/2080476?v=4" width="50px;" alt=""/><br /><sub><b>Dustin Ryerson</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=dustinryerson" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/drewbrokke"><img src="https://avatars1.githubusercontent.com/u/6403097?v=4" width="50px;" alt=""/><br /><sub><b>Drew Brokke</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=drewbrokke" title="Code">💻</a> <a href="#ideas-drewbrokke" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://twitter.com/joserobleda"><img src="https://avatars1.githubusercontent.com/u/1263865?v=4" width="50px;" alt=""/><br /><sub><b>Jose Ignacio</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=joserobleda" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/rodrigovidal"><img src="https://avatars0.githubusercontent.com/u/388081?v=4" width="50px;" alt=""/><br /><sub><b>Rodrigo Vidal</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=rodrigovidal" title="Code">💻</a></td>
    <td align="center"><a href="http://hamxabaig.github.io"><img src="https://avatars2.githubusercontent.com/u/12872177?v=4" width="50px;" alt=""/><br /><sub><b>Hamza Baig</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=hamxabaig" title="Code">💻</a></td>
    <td align="center"><a href="http://www.liferay.com/web/gregory.amerson/blog"><img src="https://avatars2.githubusercontent.com/u/595221?v=4" width="50px;" alt=""/><br /><sub><b>Gregory Amerson</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=gamerson" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Agamerson" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://blog.tomrochette.com"><img src="https://avatars2.githubusercontent.com/u/188960?v=4" width="50px;" alt=""/><br /><sub><b>Tom Rochette</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=tomzx" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Atomzx" title="Bug reports">🐛</a> <a href="#infra-tomzx" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://m-roberts.github.io"><img src="https://avatars2.githubusercontent.com/u/2947595?v=4" width="50px;" alt=""/><br /><sub><b>Mike Roberts</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=m-roberts" title="Code">💻</a></td>
    <td align="center"><a href="https://snyk.io"><img src="https://avatars2.githubusercontent.com/u/19733683?v=4" width="50px;" alt=""/><br /><sub><b>Snyk bot</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=snyk-bot" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/TheBlockchainDeveloper"><img src="https://avatars1.githubusercontent.com/u/139483?v=4" width="50px;" alt=""/><br /><sub><b>BlockchainDeveloper</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=TheBlockchainDeveloper" title="Code">💻</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/jpbochi"><img src="https://avatars1.githubusercontent.com/u/96475?v=4" width="50px;" alt=""/><br /><sub><b>João Paulo Bochi</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=jpbochi" title="Code">💻</a></td>
    <td align="center"><a href="http://maael.github.io/"><img src="https://avatars3.githubusercontent.com/u/5610674?v=4" width="50px;" alt=""/><br /><sub><b>Matthew Elphick</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=maael" title="Code">💻</a></td>
    <td align="center"><a href="http://alterform.com"><img src="https://avatars2.githubusercontent.com/u/116871?v=4" width="50px;" alt=""/><br /><sub><b>Nate Cavanaugh</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=natecavanaugh" title="Code">💻</a></td>
    <td align="center"><a href="https://www.peterdavehello.org/"><img src="https://avatars3.githubusercontent.com/u/3691490?v=4" width="50px;" alt=""/><br /><sub><b>Peter Dave Hello</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=PeterDaveHello" title="Code">💻</a></td>
    <td align="center"><a href="https://mattdesl.com/"><img src="https://avatars1.githubusercontent.com/u/1383811?v=4" width="50px;" alt=""/><br /><sub><b>Matt DesLauriers</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=mattdesl" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/oughter"><img src="https://avatars1.githubusercontent.com/u/18747026?v=4" width="50px;" alt=""/><br /><sub><b>oughter</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=oughter" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://adrianmacneil.com/"><img src="https://avatars2.githubusercontent.com/u/637671?v=4" width="50px;" alt=""/><br /><sub><b>Adrian Macneil</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=amacneil" title="Code">💻</a></td>
    <td align="center"><a href="http://kbakba.net/"><img src="https://avatars1.githubusercontent.com/u/36834?v=4" width="50px;" alt=""/><br /><sub><b>Aleksey Ostapenko</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=kbakba" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/roadhump"><img src="https://avatars3.githubusercontent.com/u/234692?v=4" width="50px;" alt=""/><br /><sub><b>Aliaksei</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=roadhump" title="Code">💻</a></td>
    <td align="center"><a href="https://akv.io"><img src="https://avatars2.githubusercontent.com/u/967317?v=4" width="50px;" alt=""/><br /><sub><b>Andrey</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=andreyvital" title="Code">💻</a></td>
    <td align="center"><a href="http://arbo.com.br"><img src="https://avatars0.githubusercontent.com/u/859765?v=4" width="50px;" alt=""/><br /><sub><b>André de Oliveira</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=arboliveira" title="Code">💻</a></td>
    <td align="center"><a href="https://slewsystems.com"><img src="https://avatars1.githubusercontent.com/u/5579960?v=4" width="50px;" alt=""/><br /><sub><b>Brandon Patram</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=bpatram" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/jbalsas"><img src="https://avatars1.githubusercontent.com/u/905006?v=4" width="50px;" alt=""/><br /><sub><b>Chema Balsas</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=jbalsas" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://cswebartisan.com"><img src="https://avatars2.githubusercontent.com/u/555044?v=4" width="50px;" alt=""/><br /><sub><b>Christian Schlensker</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=wordofchristian" title="Code">💻</a></td>
    <td align="center"><a href="http://cironunes.com/"><img src="https://avatars2.githubusercontent.com/u/469908?v=4" width="50px;" alt=""/><br /><sub><b>Ciro Nunes</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=cironunes" title="Code">💻</a></td>
    <td align="center"><a href="https://t.me/piterden"><img src="https://avatars3.githubusercontent.com/u/5930429?v=4" width="50px;" alt=""/><br /><sub><b>Denis Efremov</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=Piterden" title="Code">💻</a></td>
    <td align="center"><a href="http://henrimichel.com.br"><img src="https://avatars1.githubusercontent.com/u/2352034?v=4" width="50px;" alt=""/><br /><sub><b>Henri Cavalcante</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=henricavalcante" title="Code">💻</a></td>
    <td align="center"><a href="http://www.jakahudoklin.com"><img src="https://avatars2.githubusercontent.com/u/585547?v=4" width="50px;" alt=""/><br /><sub><b>Jaka Hudoklin</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=offlinehacker" title="Code">💻</a></td>
    <td align="center"><a href="http://twitter.com/jfroma"><img src="https://avatars3.githubusercontent.com/u/178512?v=4" width="50px;" alt=""/><br /><sub><b>José F. Romaniello</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=jfromaniello" title="Code">💻</a></td>
    <td align="center"><a href="http://joshuawu.me/"><img src="https://avatars2.githubusercontent.com/u/12107969?v=4" width="50px;" alt=""/><br /><sub><b>Joshua Wu</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=jwu910" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://keaglin.com"><img src="https://avatars0.githubusercontent.com/u/1952896?v=4" width="50px;" alt=""/><br /><sub><b>Kevon Eaglin</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=keaglin" title="Code">💻</a></td>
    <td align="center"><a href="https://mtyurt.net"><img src="https://avatars0.githubusercontent.com/u/2225537?v=4" width="50px;" alt=""/><br /><sub><b>M. Tarık Yurt</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=mtyurt" title="Code">💻</a></td>
    <td align="center"><a href="https://mbuffett.com"><img src="https://avatars3.githubusercontent.com/u/1834328?v=4" width="50px;" alt=""/><br /><sub><b>Marcus Buffett</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=marcusbuffett" title="Code">💻</a></td>
    <td align="center"><a href="https://rands0n.com"><img src="https://avatars2.githubusercontent.com/u/4191734?v=4" width="50px;" alt=""/><br /><sub><b>Randѕon</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=rands0n" title="Code">💻</a></td>
    <td align="center"><a href="http://www.earthbound.io"><img src="https://avatars1.githubusercontent.com/u/2556781?v=4" width="50px;" alt=""/><br /><sub><b>Alex Hall</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=earthbound19" title="Code">💻</a></td>
    <td align="center"><a href="http://www.dev-institut.fr"><img src="https://avatars1.githubusercontent.com/u/1372183?v=4" width="50px;" alt=""/><br /><sub><b>Rossi Oddet</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=roddet" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/rschmukler"><img src="https://avatars1.githubusercontent.com/u/651740?v=4" width="50px;" alt=""/><br /><sub><b>Ryan Schmukler</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=rschmukler" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://www.onato.com/"><img src="https://avatars2.githubusercontent.com/u/107999?v=4" width="50px;" alt=""/><br /><sub><b>Stephen Williams</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=onato" title="Code">💻</a></td>
    <td align="center"><a href="http://www.wulftone.com"><img src="https://avatars3.githubusercontent.com/u/142784?v=4" width="50px;" alt=""/><br /><sub><b>Trevor Bortins</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=wulftone" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/wbyoung"><img src="https://avatars1.githubusercontent.com/u/57162?v=4" width="50px;" alt=""/><br /><sub><b>Whitney Young</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=wbyoung" title="Code">💻</a></td>
    <td align="center"><a href="https://www.lgtm.com"><img src="https://avatars3.githubusercontent.com/u/7395402?v=4" width="50px;" alt=""/><br /><sub><b>Xavier RENE-CORAIL</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=xcorail" title="Code">💻</a></td>
    <td align="center"><a href="http://the.igreque.info/"><img src="https://avatars2.githubusercontent.com/u/227057?v=4" width="50px;" alt=""/><br /><sub><b>YAMAMOTO Yuji</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=igrep" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/smikes"><img src="https://avatars0.githubusercontent.com/u/5124609?v=4" width="50px;" alt=""/><br /><sub><b>Sam Mikes</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=smikes" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/tijuthomas"><img src="https://avatars0.githubusercontent.com/u/8406974?v=4" width="50px;" alt=""/><br /><sub><b>Tiju Thomas</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=tijuthomas" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://averba.ch"><img src="https://avatars3.githubusercontent.com/u/2838836?v=4" width="50px;" alt=""/><br /><sub><b>Zev Averbach</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=zevaverbach" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Azevaverbach" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://aaronkjones.com"><img src="https://avatars1.githubusercontent.com/u/17125755?v=4" width="50px;" alt=""/><br /><sub><b>Aaron Jones</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Aaaronkjones" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://linkedin.com/in/jrschumacher"><img src="https://avatars1.githubusercontent.com/u/46549?v=4" width="50px;" alt=""/><br /><sub><b>Ryan Schumacher</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ajrschumacher" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://robdodson.me"><img src="https://avatars0.githubusercontent.com/u/1066253?v=4" width="50px;" alt=""/><br /><sub><b>Rob Dodson</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Arobdodson" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/dsifford"><img src="https://avatars0.githubusercontent.com/u/5240018?v=4" width="50px;" alt=""/><br /><sub><b>Derek Sifford</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Adsifford" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/rachidbch"><img src="https://avatars1.githubusercontent.com/u/1119174?v=4" width="50px;" alt=""/><br /><sub><b>rachidbch</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Arachidbch" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.tabookey.com/"><img src="https://avatars0.githubusercontent.com/u/1171354?v=4" width="50px;" alt=""/><br /><sub><b>Liraz Siri</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Alirazsiri" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/zsoltbalogh"><img src="https://avatars1.githubusercontent.com/u/866157?v=4" width="50px;" alt=""/><br /><sub><b>Zsolt Balogh</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Azsoltbalogh" title="Bug reports">🐛</a> <a href="https://github.com/node-gh/gh/commits?author=zsoltbalogh" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.liferay.com/"><img src="https://avatars3.githubusercontent.com/u/78014?v=4" width="50px;" alt=""/><br /><sub><b>Iliyan Peychev</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Aipeychev" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://dante.io"><img src="https://avatars0.githubusercontent.com/u/1185063?v=4" width="50px;" alt=""/><br /><sub><b>Dante Wang</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Adantewang" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://rotty3000.github.io"><img src="https://avatars1.githubusercontent.com/u/146764?v=4" width="50px;" alt=""/><br /><sub><b>Raymond Augé</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Arotty3000" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://mbassem.com"><img src="https://avatars2.githubusercontent.com/u/2418637?v=4" width="50px;" alt=""/><br /><sub><b>Mohamed Bassem</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3AMohamedBassem" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/sez11a"><img src="https://avatars3.githubusercontent.com/u/515497?v=4" width="50px;" alt=""/><br /><sub><b>Rich Sezov</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Asez11a" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/jasonkuhrt"><img src="https://avatars3.githubusercontent.com/u/284476?v=4" width="50px;" alt=""/><br /><sub><b>Jason Kuhrt</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ajasonkuhrt" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/gon138"><img src="https://avatars0.githubusercontent.com/u/5614711?v=4" width="50px;" alt=""/><br /><sub><b>gon138</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Agon138" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/m-novikov"><img src="https://avatars2.githubusercontent.com/u/5163640?v=4" width="50px;" alt=""/><br /><sub><b>Maxim Novikov</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Am-novikov" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://andersdjohnson.com"><img src="https://avatars3.githubusercontent.com/u/615381?v=4" width="50px;" alt=""/><br /><sub><b>Anders D. Johnson</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3AAndersDJohnson" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://izaias.co"><img src="https://avatars3.githubusercontent.com/u/192261?v=4" width="50px;" alt=""/><br /><sub><b>Gabriel Izaias</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Agabrielizaias" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://smyles.dev"><img src="https://avatars3.githubusercontent.com/u/553732?v=4" width="50px;" alt=""/><br /><sub><b>Myles McNamara</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Atripflex" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.giladpeleg.com"><img src="https://avatars0.githubusercontent.com/u/4533329?v=4" width="50px;" alt=""/><br /><sub><b>Gilad Peleg</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Apgilad" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://yoshuawuyts.com"><img src="https://avatars3.githubusercontent.com/u/2467194?v=4" width="50px;" alt=""/><br /><sub><b>Yoshua Wuyts</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ayoshuawuyts" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://marclundgren.github.io/"><img src="https://avatars1.githubusercontent.com/u/1154834?v=4" width="50px;" alt=""/><br /><sub><b>Marc Lundgren</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Amarclundgren" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/juliocamarero"><img src="https://avatars0.githubusercontent.com/u/203395?v=4" width="50px;" alt=""/><br /><sub><b>Julio Camarero</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ajuliocamarero" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.liferay.com/web/marcellus.tavares/blog"><img src="https://avatars2.githubusercontent.com/u/286892?v=4" width="50px;" alt=""/><br /><sub><b>Marcellus Tavares</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Amarcellustavares" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.liferay.com/es/web/sergio.gonzalez/blog"><img src="https://avatars3.githubusercontent.com/u/860987?v=4" width="50px;" alt=""/><br /><sub><b>Sergio Gonzalez</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Asergiogonzalez" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://resume.djalmaaraujo.com/"><img src="https://avatars1.githubusercontent.com/u/3402?v=4" width="50px;" alt=""/><br /><sub><b>Djalma Araújo</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Adjalmaaraujo" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/brunobasto"><img src="https://avatars0.githubusercontent.com/u/156388?v=4" width="50px;" alt=""/><br /><sub><b>Bruno Basto</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Abrunobasto" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://jason.pincin.com/"><img src="https://avatars0.githubusercontent.com/u/1831096?v=4" width="50px;" alt=""/><br /><sub><b>Jason Pincin</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ajasonpincin" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://twitter.com/leoj3n"><img src="https://avatars2.githubusercontent.com/u/990216?v=4" width="50px;" alt=""/><br /><sub><b>Joel Kuzmarski</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Aleoj3n" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/shinzui"><img src="https://avatars3.githubusercontent.com/u/519?v=4" width="50px;" alt=""/><br /><sub><b>Nadeem Bitar</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=shinzui" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/cleydyr"><img src="https://avatars1.githubusercontent.com/u/441513?v=4" width="50px;" alt=""/><br /><sub><b>Cleydyr Bezerra de Albuquerque</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Acleydyr" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://twitter.com/rmnPires"><img src="https://avatars1.githubusercontent.com/u/1796577?v=4" width="50px;" alt=""/><br /><sub><b>Ramon Pires da Silva</b></sub></a><br /><a href="#plugin-ramonPires" title="Plugin/utility libraries">🔌</a></td>
    <td align="center"><a href="https://github.com/Lisiadito"><img src="https://avatars0.githubusercontent.com/u/13214912?v=4" width="50px;" alt=""/><br /><sub><b>Patrick Weingärtner</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=Lisiadito" title="Code">💻</a></td>
    <td align="center"><a href="http://gabrieluizramos.com.br/"><img src="https://avatars0.githubusercontent.com/u/13336905?v=4" width="50px;" alt=""/><br /><sub><b>Gabriel Ramos</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=gabrieluizramos" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mdelapenya"><img src="https://avatars2.githubusercontent.com/u/951580?v=4" width="50px;" alt=""/><br /><sub><b>Manuel de la Peña</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=mdelapenya" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://jmvidal.cse.sc.edu"><img src="https://avatars3.githubusercontent.com/u/228704?v=4" width="50px;" alt=""/><br /><sub><b>Jose M Vidal</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ajosemvidal" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://saulovallory.com"><img src="https://avatars1.githubusercontent.com/u/117560?v=4" width="50px;" alt=""/><br /><sub><b>Saulo Vallory</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=svallory" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/hernan"><img src="https://avatars0.githubusercontent.com/u/15841?v=4" width="50px;" alt=""/><br /><sub><b>Hernan Fernandez</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=hernan" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Aaron-K-T-Berry"><img src="https://avatars1.githubusercontent.com/u/24759009?v=4" width="50px;" alt=""/><br /><sub><b>Aaron Berry</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=Aaron-K-T-Berry" title="Code">💻</a></td>
    <td align="center"><a href="http://www.liferay.com/web/inacio.nery/profile"><img src="https://avatars0.githubusercontent.com/u/14062516?v=4" width="50px;" alt=""/><br /><sub><b>Inácio Nery</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ainacionery" title="Bug reports">🐛</a> <a href="https://github.com/node-gh/gh/commits?author=inacionery" title="Code">💻</a></td>
    <td align="center"><a href="http://marcbizal.com"><img src="https://avatars1.githubusercontent.com/u/1304994?v=4" width="50px;" alt=""/><br /><sub><b>Marcus Bizal</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Amarcbizal" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://julien.github.io"><img src="https://avatars2.githubusercontent.com/u/5572?v=4" width="50px;" alt=""/><br /><sub><b>Julien Castelain</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ajulien" title="Bug reports">🐛</a> <a href="https://github.com/node-gh/gh/commits?author=julien" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/cspotcode"><img src="https://avatars1.githubusercontent.com/u/376504?v=4" width="50px;" alt=""/><br /><sub><b>Andrew Bradley</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Acspotcode" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Contributing

For detailed instructions, check [Contributing](https://github.com/node-gh/gh/blob/master/CONTRIBUTING.md). Don't miss the [source code reports](https://node-gh.github.io/reports/).

## History

For detailed changelog, check [Releases](https://github.com/node-gh/gh/releases).

## License

[BSD-3-Clause](https://github.com/node-gh/gh/blob/master/LICENSE.txt)

## Demonstration

<a href="https://asciinema.org/a/214594?autoplay=1">
    <p align="center">
        <img alt="Terminal Demo" src="http://nodegh.io/images/terminal-demo.svg" width="600">
    </p>
</a>

## Supported Node Versions:

We support the node versions that the Node.js organization supports which as of now is Node v6 & up.

<p><img src="https://github.com/nodejs/Release/blob/master/schedule.svg" alt="LTS Schedule"/></p>

## Authentication

Under the hood, we are using [@octokit/rest](https://github.com/octokit/rest.js) to work with the GitHub API
The method of authentication that we use with octokit, is a personal access token
You have two options here: 1. Run `gh` which will start the authentication process & generate the token for you automatically - Though they are hidden, the downside of this is having to type your user & pass - Supports 2fa 2. [Manually generate your personal token](https://github.com/node-gh/gh/issues/450#issuecomment-490530739) & add it to your `~/.gh.json`

## Available commands

```
gh help
```

List all comands options.

```
gh help --all
```

List specific command options.

```
gh help <command>
```

### Global flags

| Option       | Usage      | Type      |
| ------------ | ---------- | --------- |
| `--verbose`  | _Optional_ | `Boolean` |
| `--insane`   | _Optional_ | `Boolean` |
| `--no-color` | _Optional_ | `Boolean` |
| `--no-hooks` | _Optional_ | `Boolean` |

The verbose flag is useful for debugging issues.
The insane flag is a more complete verbose flag, which leaks more privacy sensitive data by default.

## Pull requests

```
gh pull-request
```

> **Alias:** `gh pr`

### PR: Info

| Option           | Usage      | Type      |
| ---------------- | ---------- | --------- |
| `-u`, `--user`   | _Required_ | `String`  |
| `-I`, `--info`   | _Required_ | `Boolean` |
| `-n`, `--number` | _Required_ | `String`  |
| `-r`, `--repo`   | _Optional_ | `String`  |
| `-u`, `--user`   | _Optional_ | `String`  |

Get information about a pull request.

```
gh pr --info 1
```

### PR: List

| Option             | Usage        | Type                                                               |
| ------------------ | ------------ | ------------------------------------------------------------------ |
| `-l`, `--list`     | **Required** | `Boolean`                                                          |
| `-a`, `--all`      | _Optional_   | `Boolean`                                                          |
| `-O`, `--org`      | _Optional_   | `String`                                                           |
| `-m`, `--me`       | _Optional_   | `Boolean`                                                          |
| `-d`, `--detailed` | _Optional_   | `Boolean`                                                          |
| `--direction`      | _Optional_   | [`asc`, `desc`]                                                    |
| `--date`           | _Optional_   | `String`                                                           |
| `-b`, `--branch`   | _Optional_   | `String`                                                           |
| `--remote`         | _Optional_   | `String`                                                           |
| `-r`, `--repo`     | _Optional_   | `String`                                                           |
| `--sort`           | _Optional_   | [`created`, `updated`, `popularity`, `long-running`, `complexity`] |
| `-S`, `--state`    | _Optional_   | [`open`, `closed`]                                                 |
| `-u`, `--user`     | _Optional_   | `String`                                                           |
| `--link`           | _Optional_   | `Boolean`                                                          |

-   `user` is owner of the repository, it is the authenticated user by default.
-   `remote` is the name of the remote configuration in a git directory, i.e. origin, upstream.
-   Therefore, it only makes sense when this command is run in a git directory.
-   To turn off pretty printing of output in a table add `"pretty_print": false` to your `~/.gh-json` config
-   To adjust [pagination rules](#set-pagination-rules)

#### Examples

**Shortcut** for listing open pull requests for the current repository

```
gh pr
```

List open pull requests for all branches from all your repositories.

```
gh pr --list --all
```

List open pull requests for all branches in all repositories belonging to the "github" organization.

```
gh pr --list --all --org github
```

List open pull requests sent by logged user on current repository.

```
gh pr --list --me
```

List open pull requests in node-gh/gh repository.

```
gh pr --list --user node-gh --repo gh
```

List open pull requests with link and content.

```
gh pr --list --detailed
```

List open pull requests for a branch.

```
gh pr --list --branch master
```

List open pull requests and sort them by popularity _(comment count)_.

```
gh pr --list --sort popularity
```

List open pull requests and sort them by asc long-running _(old but still active)_.

```
gh pr --list --sort long-running --direction asc
```

List open pull requests and sort them by complexity _(complexity is calculated based on number of additions, deletions, changed files, comments and review comments)_.

```
gh pr --list --sort complexity
```

List open pull requests with their link

```
gh pr --list --link
```

List open pull requests with a formatted date (_Any string that the moment library's formatter accepts should work: https://momentjs.com/docs/#/displaying/format/_).

```
gh pr --list --date "dddd, MMMM Do YYYY, h:mm:ss a"
```

### PR: Merge or Rebase

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-f`, `--fetch`  | **Required** | `Boolean` |
| `-M`, `--merge`  | **Required** | `Boolean` |
| `-R`, `--rebase` | **Required** | `Boolean` |
| `-n`, `--number` | _Optional_   | `Number`  |
| `-b`, `--branch` | _Optional_   | `String`  |
| `--draft`        | _Optional_   | `Boolean` |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |

Omitting `--number` will try to guess the pull number from branch name e.g. `pr-1` results in `--number 1`. Omitting `--branch` will merge or rebase into `config.default_branch`.

#### Examples

**Shortcut** for fetching pull request and checkout into a new branch `pr-1`.

```
gh pr 1
```

Merge or rebase pull request into a local branch.

```
gh pr 1 --fetch --merge
```

```
gh pr 1 --fetch --rebase
```

Merge or rebase pull request into branch `dev`.

```
gh pr 1 --fetch --rebase --branch dev
```

```
gh pr 1 --fetch --merge --branch dev
```

### PR: Comment

| Option            | Usage        | Type     |
| ----------------- | ------------ | -------- |
| `-c`, `--comment` | **Required** | `String` |
| `-n`, `--number`  | **Required** | `Number` |
| `--remote`        | _Optional_   | `String` |
| `-r`, `--repo`    | _Optional_   | `String` |
| `-u`, `--user`    | _Optional_   | `String` |

#### Examples

Comment on a pull request.

```
gh pr 1 --comment "Merged, thank you!"
```

Submit a pull request using your [default editor](#set-default-editor-to-use-when-creating-a-new-message) by passing an empty `--comment`

```
gh pr 1 --comment
```

### PR Forward

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `--fwd`          | **Required** | `String` |
| `-n`, `--number` | **Required** | `Number` |

Omitting a value for `--fwd` fallbacks to the `default_pr_forwarder` key found
in your [config file](#config).

#### Examples

Forward a pull request to another reviewer.

```
gh pr 1 --fwd username
```

### PR: Open or Close

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-o`, `--open`   | **Required** | `Boolean` |
| `-C`, `--close`  | **Required** | `Boolean` |
| `-n`, `--number` | **Required** | `Number`  |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |

#### Examples

Open a pull request.

```
gh pr 1 --open
```

Close a pull request.

```
gh pr 1 --close
```

Close multiple pull requests.

```
gh pr --close --number 1 --number 2
```

Open multiple pull requests.

```
gh pr --open --number 1 --number 2
```

Open or close a pull request that you've sent to someone.

```
gh pr 1 --close --user eduardolundgren
```

### PR: Submit

| Option                | Usage        | Type     |
| --------------------- | ------------ | -------- |
| `-s`, `--submit`      | **Required** | `String` |
| `-b`, `--branch`      | _Optional_   | `String` |
| `-D`, `--description` | _Optional_   | `String` |
| `-i`, `--issue`       | _Optional_   | `Number` |
| `-r`, `--repo`        | _Optional_   | `String` |
| `-t`, `--title`       | _Optional_   | `String` |

Omitting a value for `--submit` fallbacks to the `default_pr_reviewer` key found
in your [config file](#config). Omitting `--title` will submit a pull request
using the last commit message as title.

#### Examples

Submit a pull request using the current branch to the repository owner or organization.

```
gh pr --submit eduardolundgren --title 'Fix #32' --description 'Awesome fix'
```

Submit a pull request using your [default editor](#set-default-editor-to-use-when-creating-a-new-message) by passing an empty `--title` and or `--description`

```
gh pr --submit eduardolundgren --title --description
```

Submit a pull request using the current branch to dev branch.

```
gh pr --submit eduardolundgren --branch dev
```

Submit a pull request from a issue.

```
gh pr --submit eduardolundgren --issue 150
```

Submit a pull request in draft state.

```
gh pr --submit eduardolundgren --draft
```

### PR: Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-n`, `--number`  | **Required** | `Number`  |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-r`, `--repo`    | _Optional_   | `String`  |

#### Examples

Open GitHub pull request page in the browser.

```
gh pr 100 --browser
```

## Notifications

```
gh notification
```

> **Alias:** `gh nt`

### Notifications: Latest

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-l`, `--latest` | **Required** | `Boolean` |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |
| `--date`         | _Optional_   | `String`  |

#### Examples

**Shortcut** for displaying the latest activities on the current repository.

```
gh nt
```

Display the latest activities on a certain repository.

```
gh nt --latest --user eduardolundgren --repo node-gh
```

Diplay notifications with a formatted date (_Any string that the moment library's formatter accepts should work: https://momentjs.com/docs/#/displaying/format/_).

```
gh nt --date "dddd, MMMM Do YYYY, h:mm:ss a"
```

### Notifications: Watch

| Option          | Usage        | Type      |
| --------------- | ------------ | --------- |
| `-w`, `--watch` | **Required** | `Boolean` |
| `--remote`      | _Optional_   | `String`  |
| `-r`, `--repo`  | _Optional_   | `String`  |
| `-u`, `--user`  | _Optional_   | `String`  |

#### Examples

Watch for any activity on the current repository.

```
gh nt --watch
```

Watch for any activity on a certain repository.

```
gh nt --watch --user eduardolundgren --repo node-gh
```

## Issues

```
gh issue
```

> **Alias:** `gh is`

### Issue: Create

| Option             | Usage        | Type      |
| ------------------ | ------------ | --------- |
| `-N`, `--new`      | **Required** | `Boolean` |
| `-t`, `--title`    | **Required** | `String`  |
| `-A`, `--assignee` | _Optional_   | `String`  |
| `-L`, `--labels`   | _Optional_   | `String`  |
| `-m`, `--message`  | _Optional_   | `String`  |
| `--remote`         | _Optional_   | `String`  |
| `-r`, `--repo`     | _Optional_   | `String`  |
| `-u`, `--user`     | _Optional_   | `String`  |

#### Examples

**Shortcut** for creating a new issue on the current repository.

```
gh is 'Node GH rocks!' 'Body with **Markdown** support'
```

Create a new issue using your [default editor](#set-default-editor-to-use-when-creating-a-new-message) by passing an empty `--message` (_also works with an empty title_)

```
gh is --new --title 'Node GH rocks!' --message
```

Create a new issue on a certain repository.

```
gh is --new --title 'Node GH rocks!' --message 'Body with **Markdown** support' --user eduardolundgren --repo node-gh
```

Create a new issue with labels.

```
gh is --new --title 'Node GH rocks!' --labels bug,question,test
```

Create a new issue and assign it to someone.

```
gh is --new --title 'Node GH rocks!' --assignee zenorocha
```

### Issue: Comment

| Option            | Usage        | Type     |
| ----------------- | ------------ | -------- |
| `-c`, `--comment` | **Required** | `String` |
| `-n`, `--number`  | **Required** | `Number` |
| `--remote`        | _Optional_   | `String` |
| `-r`, `--repo`    | _Optional_   | `String` |
| `-u`, `--user`    | _Optional_   | `String` |

#### Examples

Comment on an issue of the current repository.

```
gh is 1 --comment 'Node GH rocks!'
```

Comment on an issue using your [default editor](#set-default-editor-to-use-when-creating-a-new-message) by passing an empty `--comment` (_also works with an empty title_)

```
gh is 1 --comment
```

Comment on an issue of a certain repository.

```
gh is 1 --comment 'Node GH rocks!' --user eduardolundgren --repo node-gh
```

### Issue: Open or Close

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-o`, `--open`   | **Required** | `Boolean` |
| `-C`, `--close`  | **Required** | `Boolean` |
| `-n`, `--number` | **Required** | `Number`  |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |

#### Examples

Open an issue.

```
gh is 1 --open
```

Close an issue.

```
gh is 1 --close
```

Close multiple issues.

```
gh is --close --number 1 --number 2
```

Open multiple issues.

```
gh is --open --number 1 --number 2
```

Open or close an issue that you've sent to someone.

```
gh is 1 --close --user eduardolundgren
```

### Issue: List

| Option              | Usage        | Type                 |
| ------------------- | ------------ | -------------------- |
| `-l`, `--list`      | **Required** | `Boolean`            |
| `-a`, `--all`       | _Optional_   | `Boolean`            |
| `-A`, `--assignee`  | _Optional_   | `String`             |
| `--date`            | _Optional_   | `String`             |
| `-d`, `--detailed`  | _Optional_   | `Boolean`            |
| `-L`, `--labels`    | _Optional_   | `String`             |
| `-M`, `--milestone` | _Optional_   | [`Number`, `String`] |
| `--remote`          | _Optional_   | `String`             |
| `-r`, `--repo`      | _Optional_   | `String`             |
| `-S`, `--state`     | _Optional_   | [`open`, `closed`]   |
| `-u`, `--user`      | _Optional_   | `String`             |

-   To adjust [pagination rules](#set-pagination-rules)

#### Examples

**Shortcut** for listing all issues on the current repository.

```
gh is
```

List all issues from all repositories.

```
gh is --list --all
```

List issues assigned to someone.

```
gh is --list --assignee zenorocha
```

List issues with link and content.

```
gh is --list --detailed
```

List only closed issues on the current repository.

```
gh is --list --state closed
```

List issues with a formatted date (_Any string that the moment library's formatter accepts should work: https://momentjs.com/docs/#/displaying/format/_).

```
gh is --list --date "dddd, MMMM Do YYYY, h:mm:ss a"
```

List issues filtered by milestone title.

```
gh is --list --milestone "milestone title"
```

List issues that contains labels `todo` and `bug`.

```
gh is --list --labels todo,bug
```

List all issues on a certain repository.

```
gh is --list --user eduardolundgren --repo node-gh
```

### Issue: Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-n`, `--number`  | **Required** | `Number`  |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-r`, `--repo`    | _Optional_   | `String`  |

#### Examples

**Shortcut** for opening GitHub issue page in the browser.

```
gh is 100
```

Open GitHub issue page in the browser.

```
gh is 100 --browser
```

### Issue: Lock

| Option           | Usage        | Type                                            |
| ---------------- | ------------ | ----------------------------------------------- |
| `--lock`         | **Required** | `Boolean`                                       |
| `--lock-reason`  | _Optional_   | [`off-topic`, `too heated`, `resolved`, `spam`] |
| `-n`, `--number` | **Required** | `Number`                                        |
| `--remote`       | _Optional_   | `String`                                        |
| `-r`, `--repo`   | _Optional_   | `String`                                        |
| `-u`, `--user`   | _Optional_   | `String`                                        |

#### Examples

Lock issue on the current repository.

```
gh is 1 --lock
```

Lock issue on the current repository with a reason.

```
gh is 1 --lock --lock-reason resolved
```

### Issue: Search

| Option             | Usage        | Type      |
| ------------------ | ------------ | --------- |
| `-s`, `--search`   | **Required** | `Boolean` |
| `-a`, `--all`      | _Optional_   | `Boolean` |
| `-d`, `--detailed` | _Optional_   | `Boolean` |
| `-r`, `--repo`     | _Optional_   | `String`  |
| `-u`, `--user`     | _Optional_   | `String`  |

#### Examples

Search issues in current repository

```
gh is --search 'term'
```

Search issues in all repositories for a user

```
gh is --all --user node-gh --search 'term'
```

Search issues in a repository for a user

```
gh is  --user node-gh --repo gh --search 'term'
```

Search issues in a repository for a user with link and content

```
gh is  --user node-gh --repo gh --search 'term'
```

Search issues with github filters

```
gh is  --user node-gh --repo gh --search 'updated:<=2013-05-24'
```

### Issue: Assign

| Option             | Usage        | Type      |
| ------------------ | ------------ | --------- |
| `--assign`         | **Required** | `Boolean` |
| `-A`, `--assignee` | **Required** | `String`  |
| `-n`, `--number`   | **Required** | `Number`  |
| `-r`, `--repo`     | _Optional_   | `String`  |
| `-u`, `--user`     | _Optional_   | `String`  |

#### Examples

Assign an issue on the current repository to a user.

```
gh is --assign --assignee zenorocha --number 1
```

Assign an issue on a specific repository to a user.

```
gh is --assign --assignee zenorocha --number 1 --user eduardolundgren --repo gh
```

## Repo

```
gh repo
```

> **Alias:** `gh re`

### Repo: Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-r`, `--repo`    | _Optional_   | `String`  |

#### Examples

**Shortcut** for opening the GitHub repository page in the browser.

```
gh re
```

Open GitHub repository page in the browser.

```
gh re --browser --user eduardolundgren --repo node-gh
```

### Repo: List

| Option             | Usage        | Type                                            |
| ------------------ | ------------ | ----------------------------------------------- |
| `-l`, `--list`     | **Required** | `Boolean`                                       |
| `-d`, `--detailed` | _Optional_   | `Boolean`                                       |
| `-u`, `--user`     | _Optional_   | `String`                                        |
| `-t`, `--type`     | _Optional_   | [`all`, `owner`, `public`, `private`, `member`] |
| `--date`           | _Optional_   | `String`                                        |

#### Examples

List all repositories.

```
gh re --list
```

List all private repositories.

```
gh re --list --type private
```

List all repositories from someone.

```
gh re --list --user zenorocha
```

List open repositories with a formatted date (_Any string that the moment library's formatter accepts should work: https://momentjs.com/docs/#/displaying/format/_).

```
gh re --list --detailed --date "dddd, MMMM Do YYYY, h:mm:ss a"
```

### Repo: Create

| Option                 | Usage        | Type        |
| ---------------------- | ------------ | ----------- |
| `-N`, `--new`          | **Required** | `String`    |
| `-O`, `--organization` | _Optional_   | `String`    |
| `-c`, `--clone`        | _Optional_   | `Boolean`   |
| `-t`, `--type`         | _Optional_   | [`private`] |
| `--init`               | _Optional_   | `Boolean`   |
| `--gitignore`          | _Optional_   | `String`    |
| `--homepage`           | _Optional_   | `String`    |
| `--description`        | _Optional_   | `String`    |

#### Examples

Create a new GitHub repository and clone on the current directory.

```
gh re --new foo --clone
```

Create a new GitHub repository based on the name of the current directory & init with a README

```
gh re --new --clone --init
```

Create a new GitHub repository for an organization.

```
gh re --new foo --organization node-gh
```

Create a new GitHub repository using .gitignore template for Ruby.

```
gh re --new gemified --gitignore Ruby
```

Create a new private repository on GitHub, initializing it with a initial commit of the README.

```
gh re --new foo --init --type private
```

### Repo: Fork

| Option                 | Usage        | Type     |
| ---------------------- | ------------ | -------- |
| `-f`, `--fork`         | **Required** | `String` |
| `-u`, `--user`         | **Required** | `String` |
| `-O`, `--organization` | _Optional_   | `String` |

#### Examples

Fork a GitHub repository.

```
gh re --fork repo --user user
```

Fork a GitHub repository into the node-gh organization.

```
gh re --fork repo --user user --organization node-gh
```

### Repo: Delete

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `-D`, `--delete` | **Required** | `String` |
| `-u`, `--user`   | **Required** | `String` |

#### Example

Delete a repository of the logged user.

```
gh re --delete foo
```

### Repo: Clone

| Option                 | Usage        | Type     |
| ---------------------- | ------------ | -------- |
| `-c`, `--clone`        | **Required** | `String` |
| `-r`, `--repo`         | **Required** | `String` |
| `-O`, `--organization` | _Optional_   | `String` |
| `-P`, `--protocol`     | _Optional_   | `String` |
| `-u`, `--user`         | _Optional_   | `String` |

> If you have custom ssh config, you can add `"api": { "ssh_host": "custom-name", ... }` to your .gh.json file.

#### Examples

Clone a repository.

```
gh re --clone --repo gh
```

Clone a repository from a specific user using HTTPS protocol.

```
gh re --clone --user eduardolundgren --repo gh --protocol https
```

### Repo: Create Label

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-C`, `--color`        | **Required** | `String`  |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-N`, `--new`          | **Required** | `String`  |
| `-r`, `--repo`         | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

Create a label for a repository (_color is a hex code with or without literal hex symbol_).

```
gh re --label --new bug --color '#7057ff' --repo gh
```

Create a label for a user's repository.

```
gh re --label --new bug --color '#7057ff' --user eduardolundgren --repo gh
```

### Repo: Delete Label

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-D`, `--delete`       | **Required** | `String`  |
| `-r`, `--repo`         | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

Delete a label from a repository.

```
gh re --label --delete bug --repo gh
```

Delete a label from a user's repository.

```
gh re --label --delete bug --user eduardolundgren --repo gh
```

### Repo: List Labels

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-l`, `--list`         | **Required** | `Boolean` |
| `-r`, `--repo`         | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

List labels for a repository.

```
gh re --label --list --repo gh
```

List labels for a user's repository.

```
gh re --label --list --user eduardolundgren --repo gh
```

### Repo: Update Label

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-C`, `--color`        | **Required** | `String`  |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-r`, `--repo`         | **Required** | `String`  |
| `-U`, `--update`       | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

Update a label for a repository (_color is a hex code with or without literal hex symbol_).

```
gh re --label --update bug --color color --repo gh
```

Update a label for a user's repository.

```
gh re --label --update bug --color color --user eduardolundgren --repo gh
```

### Repo: Search

Find repositories via various criteria. Repository search looks through the projects you have access to on GitHub.
You can filter the results using GitHub's search qualifiers.
[Examples:](https://help.github.com/articles/searching-for-repositories/)

| Option                 | Usage        | Type                                            |
| ---------------------- | ------------ | ----------------------------------------------- |
| `-s`, `--search`       | **Required** | `Boolean`                                       |
| `-d`, `--detailed`     | _Optional_   | `Boolean`                                       |
| `-u`, `--user`         | _Optional_   | `String`                                        |
| `-r`, `--repo`         | _Optional_   | `String`                                        |
| `-O`, `--organization` | _Optional_   | `String`                                        |
| `-t`, `--type`         | _Optional_   | [`all`, `owner`, `public`, `private`, `member`] |

#### Examples

Search private repositories you have access to with the term "secret".

```
gh re --search secret --type private
```

OR

```
gh re --search secret is:private
```

Matches repositories from GitHub org showing detailed results.

```
gh re --detailed -o github --search octocat
```

OR

```
gh re --detailed --search octocat org:github
```

## Gists

```
gh gists
```

> **Alias:** `gh gi`

### Gist: Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-i`, `--id`      | _Optional_   | `String`  |

#### Examples

**Shortcut** for opening your Gists in the browser.

```
gh gi
```

Open a Gist in the browser.

```
gh gi --browser --id 5991877
```

### Gist: List

| Option         | Usage        | Type      |
| -------------- | ------------ | --------- |
| `-l`, `--list` | **Required** | `Boolean` |
| `-u`, `--user` | _Optional_   | `String`  |
| `--date`       | _Optional_   | `String`  |

#### Examples

List all gists.

```
gh gi --list
```

List all gists from someone.

```
gh gi --list --user brunocoelho
```

List gists with a formatted date (_Any string that the moment library's formatter accepts should work: https://momentjs.com/docs/#/displaying/format/_).

```
gh gi --list --date "dddd, MMMM Do YYYY, h:mm:ss a"
```

### Gist: Create

| Option                | Usage        | Type      |
| --------------------- | ------------ | --------- |
| `-N`, `--new`         | **Required** | `String`  |
| `-c`, `--content`     | _Optional_   | `String`  |
| `-d`, `--description` | _Optional_   | `String`  |
| `-p`, `--private`     | _Optional_   | `Boolean` |

#### Examples

Create a Gist `hello` containing "Hello World".

```
gh gi --new hello --content "Hello World!"
```

Create a private Gist `hello` containing "Hello World".

```
gh gi --new hello --content "Hello World!" --private
```

### Gist: Fork

| Option         | Usage        | Type     |
| -------------- | ------------ | -------- |
| `-f`, `--fork` | **Required** | `String` |

#### Examples

Fork a Gist.

```
gh gi --fork 5444883
```

### Gist: Delete

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `-D`, `--delete` | **Required** | `String` |

#### Example

Delete a Gist.

```
gh gi --delete 4252323
```

Delete multiple Gists.

```
gh gi --delete 4252321 --delete 4252322
```

## User

```
gh user
```

> **Alias:** `gh us`

### User: Login or Logout

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-l`, `--login`  | **Required** | `Boolean` |
| `-L`, `--logout` | **Required** | `Boolean` |

#### Examples

Automates saving user name & generating developer token credentials to your ~/.gh.json config

-   This is the the user that will be used if you do not manually pass in `--user username`
-   After you are logged in, you should no longer be prompted to go through the login process again
-   Alternatively you can create your own developer key and copy and paste it
    -   First add a file in your home directory called `~/.gh.json`
    -   You can use the `default.gh.json` file in our repo as a template
    -   [Create a developer key](https://github.com/settings/tokens/new): with these scopes: `['user', 'public_repo', 'repo', 'repo:status', 'delete_repo', 'gist']`
    -   Then copy & paste your token in the file at: `"github_token"`
    -   Write your user name at `"github_user"`

```
gh user --login
```

Automates removing user name & developer token credentials to your ~/.gh.json config

```
gh user --logout
```

### User: Whoami

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-w`, `--whoami` | **Required** | `Boolean` |

#### Examples

Prints the user name from ~/.gh.json to your console.

```
gh user --whoami
```

## Milestones

```
gh milestone
```

> **Alias:** `gh ms`

### Milestone: List

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-l`, `--list`         | **Required** | `Boolean` |
| `-u`, `--user`         | _Required_   | `String`  |
| `-a`, `--all`          | _Required_   | `Boolean` |
| `-r`, `--repo`         | _Optional_   | `String`  |
| `-o`, `--organization` | _Optional_   | `String`  |

#### Examples

**Shortcut** for listing milestones for a specific repo.

```
gh ms
```

Listing milestones for a specific repo & user.

```
gh ms --list --user node-gh --repo gh
```

Listing all milestones for a specific organization.

```
gh ms --list --all --organization node-gh
```

## Alias

This cmd provides something similar to shell aliases. If there are aliases in your .gh.json file, we will attempt to resolve the user, PR forwarder or PR submitter to your alias.

```
gh alias
```

> **Alias:** `gh al`

### Alias: List

| Option         | Usage        | Type      |
| -------------- | ------------ | --------- |
| `-l`, `--list` | **Required** | `Boolean` |

#### Examples

**Shortcut** for listing aliases.

```
gh alias
```

List aliases.

```
gh alias --list
```

### Alias: Add

| Option         | Usage        | Type     |
| -------------- | ------------ | -------- |
| `-a`, `--add`  | **Required** | `String` |
| `-u`, `--user` | **Required** | `String` |

#### Examples

Create alias for username.

```
gh alias --add zeno --user zenorocha
```

And use like:

```
gh pr --submit zeno -b master -t Title
```

### Alias: Remove

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `-r`, `--remove` | **Required** | `String` |

#### Examples

Remove alias.

```
gh alias --remove zeno
```

## Config

There are some pretty useful configurations that you can set on [.gh.json](default.gh.json).
This file can be found under home directory _(on MacOSx: `/Users/yourName/.gh.json` on Windows: `C:\\Users\yourName\.gh.json`)_.

You can also set per-project configurations by adding a `.gh.json` file in your project's root folder and overriding existing keys.

### GitHub API configurations.

Change it if you're a [GitHub Enterprise](https://enterprise.github.com/) user.

```javascript
"api": {
    "host": "github.mydomain.com",
    "protocol": "https"
}
```

### Set Pagination Rules

-   For list based commands (_like listing prs, issues, or repos_) we **default to 30**
-   That means if you ran `gh pr` you would see a max of 30 pull requests
-   If you would like to see more, we will prompt you in your terminal to see the next batch
-   You can set your page size up from `1` to `100`

```json
"page_size": 77
```

-   If you want to remove the limit & set it to the maximum, use an empty string

```json
"page_size": ""
```

### Set default branch and remote.

```javascript
"default_branch": "master",
"default_remote": "origin"
```

### Set default users

For [submitting](#pr-submit) or [forwarding](#pr-forward) pull requests.

```javascript
"default_pr_forwarder": "",
"default_pr_reviewer": ""
```

### Update GitHub credentials manually

```javascript
"github_token": "your_dev_token",
"github_user": "username"
```

### Run automated tasks before or after a certain command.

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

### Run automated tasks passing arguments to the commands.

Required for prompt commands.

```javascript
"hooks": {
        "pull-request": {
            "merge": {
                "before": [{"cmd": "foo", "args": ["bar", "qux"]}]
            }
        }
}
```

### Set default branch name prefix for PR fetching.

```javascript
"pull_branch_name_prefix": "pr-"
```

### Set default editor to use when creating a new message

-   For certain tasks like opening a pull request when you omit the title or description, we will open a new file for you to create the message in.
-   We first check enviroment variables for the default editor: `$EDITOR` or `$VISUAL` and fallback to the default git editor `git config --global core.editor`
-   To **disable** this functionality of opening your editor add `"use_editor": false` to `~/.gh.json`

### Insert signature below issue comment.

```javascript
"signature": "<br><br>:octocat: *Sent from [GH](http://nodegh.io).*"
```

### Turn off ssh when pulling a repo and use https instead.

```javascript
"ssh": false,
```

If you need to use a custom git command, set the environment variable `GH_GIT_COMMAND`.

## Plugins

[GH Gif](https://github.com/node-gh/gh-gif) - A plugin for commenting on pull requests/issues using GIF reactions.
[GH Travis](https://github.com/node-gh/gh-travis) - A plugin for integrating Travis, a continous integration server.
[GH Jira](https://github.com/node-gh/gh-jira) - A plugin for integrating Jira, an issue management system.

Feel free to create your own plugins by forking [GH Boilerplate](https://github.com/node-gh/gh-boilerplate).
