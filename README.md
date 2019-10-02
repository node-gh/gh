# Node GH

[![All Contributors](https://img.shields.io/badge/all_contributors-79-orange.svg?style=flat-square)](#contributors-)
[![NPM version](http://img.shields.io/npm/v/gh.svg?style=flat)](http://npmjs.org/gh)
[![Build Status](http://img.shields.io/travis/node-gh/gh/master.svg?style=flat)](https://travis-ci.org/node-gh/gh)
[![Known Vulnerabilities](https://snyk.io/test/github/node-gh/gh/badge.svg)](https://snyk.io/test/github/node-gh/gh)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/node-gh/gh.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/node-gh/gh/context:javascript)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/node-gh/gh.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/node-gh/gh/alerts)

> All the power of GitHub in your terminal.

## Table of contents

-   [Install](#install)
-   [Usage](#usage)
-   [Contributors](#contributors)
-   [Contributing](#contributing)
-   [History](#history)
-   [License](#license)
-   [Demonstration](#demonstration)
-   [Supported Node Versions](#supported-node-versions)
-   [Available commands](#available-commands)
    -   [Pull requests](#pull-requests)
    -   [Notifications](#notifications)
    -   [Issues](#issues)
    -   [Repo](#repo)
    -   [Gists](#gists)
    -   [User](#user)
    -   [Milestone](#milestone)
    -   [Alias](#alias)
-   [Config](#config)
-   [Plugins](#plugins)

## Install

    [sudo] npm install -g gh

## Usage

    gh [command] [--flags]

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/eduardolundgren"><img src="https://avatars0.githubusercontent.com/u/113087?v=4" width="50px;" alt="Eduardo Lundgren"/><br /><sub><b>Eduardo Lundgren</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=eduardolundgren" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Aeduardolundgren" title="Bug reports">🐛</a> <a href="https://github.com/node-gh/gh/commits?author=eduardolundgren" title="Documentation">📖</a><br /> <a href="#question-eduardolundgren" title="Answering Questions">💬</a> <a href="#infra-eduardolundgren" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#plugin-eduardolundgren" title="Plugin/utility libraries">🔌</a> <br /><a href="https://github.com/node-gh/gh/commits?author=eduardolundgren" title="Tests">⚠️</a> <a href="#review-eduardolundgren" title="Reviewed Pull Requests">👀</a> <a href="#ideas-eduardolundgren" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://zenorocha.com"><img src="https://avatars1.githubusercontent.com/u/398893?v=4" width="50px;" alt="Zeno Rocha"/><br /><sub><b>Zeno Rocha</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=zenorocha" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Azenorocha" title="Bug reports">🐛</a> <a href="https://github.com/node-gh/gh/commits?author=zenorocha" title="Documentation">📖</a><br /> <a href="#question-zenorocha" title="Answering Questions">💬</a> <a href="#infra-zenorocha" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#plugin-zenorocha" title="Plugin/utility libraries">🔌</a> <br /><a href="https://github.com/node-gh/gh/commits?author=zenorocha" title="Tests">⚠️</a> <a href="#review-zenorocha" title="Reviewed Pull Requests">👀</a> <a href="#ideas-zenorocha" title="Ideas, Planning, & Feedback">🤔</a><br /> <a href="#content-zenorocha" title="Content">🖋</a></td>
    <td align="center"><a href="https://henvic.github.io/"><img src="https://avatars3.githubusercontent.com/u/936421?v=4" width="50px;" alt="Henrique Vicente"/><br /><sub><b>Henrique Vicente</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=henvic" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Ahenvic" title="Bug reports">🐛</a> <a href="#question-henvic" title="Answering Questions">💬</a> <br /><a href="#infra-henvic" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#plugin-henvic" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/node-gh/gh/commits?author=henvic" title="Tests">⚠️</a> <br /><a href="#review-henvic" title="Reviewed Pull Requests">👀</a> <a href="#security-henvic" title="Security">🛡️</a> <a href="#ideas-henvic" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/protoEvangelion"><img src="https://avatars3.githubusercontent.com/u/20076677?v=4" width="50px;" alt="Ryan Garant"/><br /><sub><b>Ryan Garant</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3AprotoEvangelion" title="Bug reports">🐛</a> <a href="#question-protoEvangelion" title="Answering Questions">💬</a> <a href="#infra-protoEvangelion" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a><br /> <a href="#plugin-protoEvangelion" title="Plugin/utility libraries">🔌</a> <a href="https://github.com/node-gh/gh/commits?author=protoEvangelion" title="Tests">⚠️</a> <a href="#review-protoEvangelion" title="Reviewed Pull Requests">👀</a> <br /><a href="#security-protoEvangelion" title="Security">🛡️</a><a href="#ideas-protoEvangelion" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/brunocoelho"><img src="https://avatars1.githubusercontent.com/u/827445?v=4" width="50px;" alt="Bruno Coelho"/><br /><sub><b>Bruno Coelho</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=brunocoelho" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Abrunocoelho" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.joyent.com/"><img src="https://avatars1.githubusercontent.com/u/2080476?v=4" width="50px;" alt="Dustin Ryerson"/><br /><sub><b>Dustin Ryerson</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=dustinryerson" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/drewbrokke"><img src="https://avatars1.githubusercontent.com/u/6403097?v=4" width="50px;" alt="Drew Brokke"/><br /><sub><b>Drew Brokke</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=drewbrokke" title="Code">💻</a> <a href="#ideas-drewbrokke" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://twitter.com/joserobleda"><img src="https://avatars1.githubusercontent.com/u/1263865?v=4" width="50px;" alt="Jose Ignacio"/><br /><sub><b>Jose Ignacio</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=joserobleda" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/rodrigovidal"><img src="https://avatars0.githubusercontent.com/u/388081?v=4" width="50px;" alt="Rodrigo Vidal"/><br /><sub><b>Rodrigo Vidal</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=rodrigovidal" title="Code">💻</a></td>
    <td align="center"><a href="http://hamxabaig.github.io"><img src="https://avatars2.githubusercontent.com/u/12872177?v=4" width="50px;" alt="Hamza Baig"/><br /><sub><b>Hamza Baig</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=hamxabaig" title="Code">💻</a></td>
    <td align="center"><a href="http://www.liferay.com/web/gregory.amerson/blog"><img src="https://avatars2.githubusercontent.com/u/595221?v=4" width="50px;" alt="Gregory Amerson"/><br /><sub><b>Gregory Amerson</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=gamerson" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Agamerson" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://blog.tomrochette.com"><img src="https://avatars2.githubusercontent.com/u/188960?v=4" width="50px;" alt="Tom Rochette"/><br /><sub><b>Tom Rochette</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=tomzx" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Atomzx" title="Bug reports">🐛</a> <a href="#infra-tomzx" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://m-roberts.github.io"><img src="https://avatars2.githubusercontent.com/u/2947595?v=4" width="50px;" alt="Mike Roberts"/><br /><sub><b>Mike Roberts</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=m-roberts" title="Code">💻</a></td>
    <td align="center"><a href="https://snyk.io"><img src="https://avatars2.githubusercontent.com/u/19733683?v=4" width="50px;" alt="Snyk bot"/><br /><sub><b>Snyk bot</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=snyk-bot" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/TheBlockchainDeveloper"><img src="https://avatars1.githubusercontent.com/u/139483?v=4" width="50px;" alt="BlockchainDeveloper"/><br /><sub><b>BlockchainDeveloper</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=TheBlockchainDeveloper" title="Code">💻</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/jpbochi"><img src="https://avatars1.githubusercontent.com/u/96475?v=4" width="50px;" alt="João Paulo Bochi"/><br /><sub><b>João Paulo Bochi</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=jpbochi" title="Code">💻</a></td>
    <td align="center"><a href="http://maael.github.io/"><img src="https://avatars3.githubusercontent.com/u/5610674?v=4" width="50px;" alt="Matthew Elphick"/><br /><sub><b>Matthew Elphick</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=maael" title="Code">💻</a></td>
    <td align="center"><a href="http://alterform.com"><img src="https://avatars2.githubusercontent.com/u/116871?v=4" width="50px;" alt="Nate Cavanaugh"/><br /><sub><b>Nate Cavanaugh</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=natecavanaugh" title="Code">💻</a></td>
    <td align="center"><a href="https://www.peterdavehello.org/"><img src="https://avatars3.githubusercontent.com/u/3691490?v=4" width="50px;" alt="Peter Dave Hello"/><br /><sub><b>Peter Dave Hello</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=PeterDaveHello" title="Code">💻</a></td>
    <td align="center"><a href="https://mattdesl.com/"><img src="https://avatars1.githubusercontent.com/u/1383811?v=4" width="50px;" alt="Matt DesLauriers"/><br /><sub><b>Matt DesLauriers</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=mattdesl" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/oughter"><img src="https://avatars1.githubusercontent.com/u/18747026?v=4" width="50px;" alt="oughter"/><br /><sub><b>oughter</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=oughter" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://adrianmacneil.com/"><img src="https://avatars2.githubusercontent.com/u/637671?v=4" width="50px;" alt="Adrian Macneil"/><br /><sub><b>Adrian Macneil</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=amacneil" title="Code">💻</a></td>
    <td align="center"><a href="http://kbakba.net/"><img src="https://avatars1.githubusercontent.com/u/36834?v=4" width="50px;" alt="Aleksey Ostapenko"/><br /><sub><b>Aleksey Ostapenko</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=kbakba" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/roadhump"><img src="https://avatars3.githubusercontent.com/u/234692?v=4" width="50px;" alt="Aliaksei"/><br /><sub><b>Aliaksei</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=roadhump" title="Code">💻</a></td>
    <td align="center"><a href="https://akv.io"><img src="https://avatars2.githubusercontent.com/u/967317?v=4" width="50px;" alt="Andrey"/><br /><sub><b>Andrey</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=andreyvital" title="Code">💻</a></td>
    <td align="center"><a href="http://arbo.com.br"><img src="https://avatars0.githubusercontent.com/u/859765?v=4" width="50px;" alt="André de Oliveira"/><br /><sub><b>André de Oliveira</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=arboliveira" title="Code">💻</a></td>
    <td align="center"><a href="https://slewsystems.com"><img src="https://avatars1.githubusercontent.com/u/5579960?v=4" width="50px;" alt="Brandon Patram"/><br /><sub><b>Brandon Patram</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=bpatram" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/jbalsas"><img src="https://avatars1.githubusercontent.com/u/905006?v=4" width="50px;" alt="Chema Balsas"/><br /><sub><b>Chema Balsas</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=jbalsas" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://cswebartisan.com"><img src="https://avatars2.githubusercontent.com/u/555044?v=4" width="50px;" alt="Christian Schlensker"/><br /><sub><b>Christian Schlensker</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=wordofchristian" title="Code">💻</a></td>
    <td align="center"><a href="http://cironunes.com/"><img src="https://avatars2.githubusercontent.com/u/469908?v=4" width="50px;" alt="Ciro Nunes"/><br /><sub><b>Ciro Nunes</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=cironunes" title="Code">💻</a></td>
    <td align="center"><a href="https://t.me/piterden"><img src="https://avatars3.githubusercontent.com/u/5930429?v=4" width="50px;" alt="Denis Efremov"/><br /><sub><b>Denis Efremov</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=Piterden" title="Code">💻</a></td>
    <td align="center"><a href="http://henrimichel.com.br"><img src="https://avatars1.githubusercontent.com/u/2352034?v=4" width="50px;" alt="Henri Cavalcante"/><br /><sub><b>Henri Cavalcante</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=henricavalcante" title="Code">💻</a></td>
    <td align="center"><a href="http://www.jakahudoklin.com"><img src="https://avatars2.githubusercontent.com/u/585547?v=4" width="50px;" alt="Jaka Hudoklin"/><br /><sub><b>Jaka Hudoklin</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=offlinehacker" title="Code">💻</a></td>
    <td align="center"><a href="http://twitter.com/jfroma"><img src="https://avatars3.githubusercontent.com/u/178512?v=4" width="50px;" alt="José F. Romaniello"/><br /><sub><b>José F. Romaniello</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=jfromaniello" title="Code">💻</a></td>
    <td align="center"><a href="http://joshuawu.me/"><img src="https://avatars2.githubusercontent.com/u/12107969?v=4" width="50px;" alt="Joshua Wu"/><br /><sub><b>Joshua Wu</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=jwu910" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://keaglin.com"><img src="https://avatars0.githubusercontent.com/u/1952896?v=4" width="50px;" alt="Kevon Eaglin"/><br /><sub><b>Kevon Eaglin</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=keaglin" title="Code">💻</a></td>
    <td align="center"><a href="https://mtyurt.net"><img src="https://avatars0.githubusercontent.com/u/2225537?v=4" width="50px;" alt="M. Tarık Yurt"/><br /><sub><b>M. Tarık Yurt</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=mtyurt" title="Code">💻</a></td>
    <td align="center"><a href="https://mbuffett.com"><img src="https://avatars3.githubusercontent.com/u/1834328?v=4" width="50px;" alt="Marcus Buffett"/><br /><sub><b>Marcus Buffett</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=marcusbuffett" title="Code">💻</a></td>
    <td align="center"><a href="https://rands0n.com"><img src="https://avatars2.githubusercontent.com/u/4191734?v=4" width="50px;" alt="Randѕon"/><br /><sub><b>Randѕon</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=rands0n" title="Code">💻</a></td>
    <td align="center"><a href="http://www.earthbound.io"><img src="https://avatars1.githubusercontent.com/u/2556781?v=4" width="50px;" alt="Alex Hall"/><br /><sub><b>Alex Hall</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=earthbound19" title="Code">💻</a></td>
    <td align="center"><a href="http://www.dev-institut.fr"><img src="https://avatars1.githubusercontent.com/u/1372183?v=4" width="50px;" alt="Rossi Oddet"/><br /><sub><b>Rossi Oddet</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=roddet" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/rschmukler"><img src="https://avatars1.githubusercontent.com/u/651740?v=4" width="50px;" alt="Ryan Schmukler"/><br /><sub><b>Ryan Schmukler</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=rschmukler" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://www.onato.com/"><img src="https://avatars2.githubusercontent.com/u/107999?v=4" width="50px;" alt="Stephen Williams"/><br /><sub><b>Stephen Williams</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=onato" title="Code">💻</a></td>
    <td align="center"><a href="http://www.wulftone.com"><img src="https://avatars3.githubusercontent.com/u/142784?v=4" width="50px;" alt="Trevor Bortins"/><br /><sub><b>Trevor Bortins</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=wulftone" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/wbyoung"><img src="https://avatars1.githubusercontent.com/u/57162?v=4" width="50px;" alt="Whitney Young"/><br /><sub><b>Whitney Young</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=wbyoung" title="Code">💻</a></td>
    <td align="center"><a href="https://www.lgtm.com"><img src="https://avatars3.githubusercontent.com/u/7395402?v=4" width="50px;" alt="Xavier RENE-CORAIL"/><br /><sub><b>Xavier RENE-CORAIL</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=xcorail" title="Code">💻</a></td>
    <td align="center"><a href="http://the.igreque.info/"><img src="https://avatars2.githubusercontent.com/u/227057?v=4" width="50px;" alt="YAMAMOTO Yuji"/><br /><sub><b>YAMAMOTO Yuji</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=igrep" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/smikes"><img src="https://avatars0.githubusercontent.com/u/5124609?v=4" width="50px;" alt="Sam Mikes"/><br /><sub><b>Sam Mikes</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=smikes" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/tijuthomas"><img src="https://avatars0.githubusercontent.com/u/8406974?v=4" width="50px;" alt="Tiju Thomas"/><br /><sub><b>Tiju Thomas</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=tijuthomas" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://averba.ch"><img src="https://avatars3.githubusercontent.com/u/2838836?v=4" width="50px;" alt="Zev Averbach"/><br /><sub><b>Zev Averbach</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=zevaverbach" title="Code">💻</a> <a href="https://github.com/node-gh/gh/issues?q=author%3Azevaverbach" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://aaronkjones.com"><img src="https://avatars1.githubusercontent.com/u/17125755?v=4" width="50px;" alt="Aaron Jones"/><br /><sub><b>Aaron Jones</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Aaaronkjones" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://linkedin.com/in/jrschumacher"><img src="https://avatars1.githubusercontent.com/u/46549?v=4" width="50px;" alt="Ryan Schumacher"/><br /><sub><b>Ryan Schumacher</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ajrschumacher" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://robdodson.me"><img src="https://avatars0.githubusercontent.com/u/1066253?v=4" width="50px;" alt="Rob Dodson"/><br /><sub><b>Rob Dodson</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Arobdodson" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/dsifford"><img src="https://avatars0.githubusercontent.com/u/5240018?v=4" width="50px;" alt="Derek Sifford"/><br /><sub><b>Derek Sifford</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Adsifford" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/rachidbch"><img src="https://avatars1.githubusercontent.com/u/1119174?v=4" width="50px;" alt="rachidbch"/><br /><sub><b>rachidbch</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Arachidbch" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.tabookey.com/"><img src="https://avatars0.githubusercontent.com/u/1171354?v=4" width="50px;" alt="Liraz Siri"/><br /><sub><b>Liraz Siri</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Alirazsiri" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/zsoltbalogh"><img src="https://avatars1.githubusercontent.com/u/866157?v=4" width="50px;" alt="Zsolt Balogh"/><br /><sub><b>Zsolt Balogh</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Azsoltbalogh" title="Bug reports">🐛</a> <a href="https://github.com/node-gh/gh/commits?author=zsoltbalogh" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.liferay.com/"><img src="https://avatars3.githubusercontent.com/u/78014?v=4" width="50px;" alt="Iliyan Peychev"/><br /><sub><b>Iliyan Peychev</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Aipeychev" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://dante.io"><img src="https://avatars0.githubusercontent.com/u/1185063?v=4" width="50px;" alt="Dante Wang"/><br /><sub><b>Dante Wang</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Adantewang" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://rotty3000.github.io"><img src="https://avatars1.githubusercontent.com/u/146764?v=4" width="50px;" alt="Raymond Augé"/><br /><sub><b>Raymond Augé</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Arotty3000" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://mbassem.com"><img src="https://avatars2.githubusercontent.com/u/2418637?v=4" width="50px;" alt="Mohamed Bassem"/><br /><sub><b>Mohamed Bassem</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3AMohamedBassem" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/sez11a"><img src="https://avatars3.githubusercontent.com/u/515497?v=4" width="50px;" alt="Rich Sezov"/><br /><sub><b>Rich Sezov</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Asez11a" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/jasonkuhrt"><img src="https://avatars3.githubusercontent.com/u/284476?v=4" width="50px;" alt="Jason Kuhrt"/><br /><sub><b>Jason Kuhrt</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ajasonkuhrt" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/gon138"><img src="https://avatars0.githubusercontent.com/u/5614711?v=4" width="50px;" alt="gon138"/><br /><sub><b>gon138</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Agon138" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/m-novikov"><img src="https://avatars2.githubusercontent.com/u/5163640?v=4" width="50px;" alt="Maxim Novikov"/><br /><sub><b>Maxim Novikov</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Am-novikov" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://andersdjohnson.com"><img src="https://avatars3.githubusercontent.com/u/615381?v=4" width="50px;" alt="Anders D. Johnson"/><br /><sub><b>Anders D. Johnson</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3AAndersDJohnson" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://izaias.co"><img src="https://avatars3.githubusercontent.com/u/192261?v=4" width="50px;" alt="Gabriel Izaias"/><br /><sub><b>Gabriel Izaias</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Agabrielizaias" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://smyles.dev"><img src="https://avatars3.githubusercontent.com/u/553732?v=4" width="50px;" alt="Myles McNamara"/><br /><sub><b>Myles McNamara</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Atripflex" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.giladpeleg.com"><img src="https://avatars0.githubusercontent.com/u/4533329?v=4" width="50px;" alt="Gilad Peleg"/><br /><sub><b>Gilad Peleg</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Apgilad" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://yoshuawuyts.com"><img src="https://avatars3.githubusercontent.com/u/2467194?v=4" width="50px;" alt="Yoshua Wuyts"/><br /><sub><b>Yoshua Wuyts</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ayoshuawuyts" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://marclundgren.github.io/"><img src="https://avatars1.githubusercontent.com/u/1154834?v=4" width="50px;" alt="Marc Lundgren"/><br /><sub><b>Marc Lundgren</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Amarclundgren" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/juliocamarero"><img src="https://avatars0.githubusercontent.com/u/203395?v=4" width="50px;" alt="Julio Camarero"/><br /><sub><b>Julio Camarero</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ajuliocamarero" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.liferay.com/web/marcellus.tavares/blog"><img src="https://avatars2.githubusercontent.com/u/286892?v=4" width="50px;" alt="Marcellus Tavares"/><br /><sub><b>Marcellus Tavares</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Amarcellustavares" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.liferay.com/es/web/sergio.gonzalez/blog"><img src="https://avatars3.githubusercontent.com/u/860987?v=4" width="50px;" alt="Sergio Gonzalez"/><br /><sub><b>Sergio Gonzalez</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Asergiogonzalez" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://resume.djalmaaraujo.com/"><img src="https://avatars1.githubusercontent.com/u/3402?v=4" width="50px;" alt="Djalma Araújo"/><br /><sub><b>Djalma Araújo</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Adjalmaaraujo" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/brunobasto"><img src="https://avatars0.githubusercontent.com/u/156388?v=4" width="50px;" alt="Bruno Basto"/><br /><sub><b>Bruno Basto</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Abrunobasto" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://jason.pincin.com/"><img src="https://avatars0.githubusercontent.com/u/1831096?v=4" width="50px;" alt="Jason Pincin"/><br /><sub><b>Jason Pincin</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Ajasonpincin" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://twitter.com/leoj3n"><img src="https://avatars2.githubusercontent.com/u/990216?v=4" width="50px;" alt="Joel Kuzmarski"/><br /><sub><b>Joel Kuzmarski</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Aleoj3n" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/shinzui"><img src="https://avatars3.githubusercontent.com/u/519?v=4" width="50px;" alt="Nadeem Bitar"/><br /><sub><b>Nadeem Bitar</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=shinzui" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/cleydyr"><img src="https://avatars1.githubusercontent.com/u/441513?v=4" width="50px;" alt="Cleydyr Bezerra de Albuquerque"/><br /><sub><b>Cleydyr Bezerra <br />de Albuquerque</b></sub></a><br /><a href="https://github.com/node-gh/gh/issues?q=author%3Acleydyr" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://twitter.com/rmnPires"><img src="https://avatars1.githubusercontent.com/u/1796577?v=4" width="50px;" alt="Ramon Pires da Silva"/><br /><sub><b>Ramon Pires da Silva</b></sub></a><br /><a href="#plugin-ramonPires" title="Plugin/utility libraries">🔌</a></td>
    <td align="center"><a href="https://github.com/Lisiadito"><img src="https://avatars0.githubusercontent.com/u/13214912?v=4" width="50px;" alt="Patrick Weingärtner"/><br /><sub><b>Patrick Weingärtner</b></sub></a><br /><a href="https://github.com/node-gh/gh/commits?author=Lisiadito" title="Code">💻</a></td>
  </tr>
</table>

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

-   We support the node versions that the Node.js organization supports which as of now is Node v6 & up.

<p><img src="https://github.com/nodejs/Release/blob/master/schedule.svg" alt="LTS Schedule"/></p>

## Authentication

-   Under the hood, we are using [@octokit/rest](https://github.com/octokit/rest.js) to work with the GitHub API
-   The method of authentication that we use with octokit, is a personal access token
-   You have two options here:
    1. Run `gh` which will start the authentication process & generate the token for you automatically
        - Though they are hidden, the downside of this is having to type your user & pass
        - Supports 2fa
    2. [Manually generate your personal token](https://github.com/node-gh/gh/issues/450#issuecomment-490530739) & add it to your `~/.gh.json`

## Available commands

```
gh help
```

-   List all comands options.

```
gh help --all
```

-   List specific command options.

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

### 1. Info

| Option           | Usage      | Type      |
| ---------------- | ---------- | --------- |
| `-u`, `--user`   | _Required_ | `String`  |
| `-I`, `--info`   | _Required_ | `Boolean` |
| `-n`, `--number` | _Required_ | `String`  |
| `-r`, `--repo`   | _Optional_ | `String`  |
| `-u`, `--user`   | _Optional_ | `String`  |

```
gh pr
```

-   Get information about a pull request.

```
gh pr --info number
```

### 2. List

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

`user` is owner of the repository, it is the authenticated user by default.
`remote` is the name of the remote configuration in a git directory, i.e. origin, upstream. Therefore, it only makes sense when this command is run in a git directory.

#### Examples

-   **Shortcut** for listing open pull requests for the current repository.
-   To turn off pretty printing of output in a table add `"pretty_print": false` to your `~/.gh-json` config

-   List open pull requests for all branches from all your repositories.

```
gh pr --list --all
```

-   List open pull requests for all branches in all repositories belonging to the "github" organization.

```
gh pr --list --all --org github
```

-   List open pull requests sent by logged user on current repository.

```
gh pr --list --me
```

-   List open pull requests in node-gh/gh repository.

```
gh pr --list --user node-gh --repo gh
```

-   List open pull requests with link and content.

```
gh pr --list --detailed
```

-   List open pull requests for a branch.

```
gh pr --list --branch master
```

-   List open pull requests and sort them by popularity _(comment count)_.

```
gh pr --list --sort popularity
```

-   List open pull requests and sort them by asc long-running _(old but still active)_.

```
gh pr --list --sort long-running --direction asc
```

-   List open pull requests and sort them by complexity _(complexity is calculated based on number of additions, deletions, changed files, comments and review comments)_.

```
gh pr --list --sort complexity
```

-   List open pull requests with their link

```
gh pr --list --link
```

-   List open pull requests with a formatted date (_Any string that the moment library's formatter accepts should work: https://momentjs.com/docs/#/displaying/format/_).

```
gh pr --list --date "dddd, MMMM Do YYYY, h:mm:ss a"
```

### 3. Fetch

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-f`, `--fetch`  | **Required** | `Boolean` |
| `-n`, `--number` | **Required** | `Number`  |
| `-M`, `--merge`  | _Optional_   | `Boolean` |
| `-R`, `--rebase` | _Optional_   | `Boolean` |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for fetching pull request and checkout into a new branch `pr-1`.

```
gh pr 1
```

-   Fech pull request rebasing or merging into the current branch.

```
gh pr 1 --fetch --rebase
```

```
gh pr 1 --fetch --merge
```

### 4. Merge or rebase

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
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

-   Merge or rebase pull request into a local branch.

```
gh pr 1 --fetch --merge
```

```
gh pr 1 --fetch --rebase
```

-   Merge or rebase pull request into branch `dev`.

```
gh pr 1 --fetch --rebase --branch dev
```

```
gh pr 1 --fetch --merge --branch dev
```

### 5. Comment

| Option            | Usage        | Type     |
| ----------------- | ------------ | -------- |
| `-c`, `--comment` | **Required** | `String` |
| `-n`, `--number`  | **Required** | `Number` |
| `--remote`        | _Optional_   | `String` |
| `-r`, `--repo`    | _Optional_   | `String` |
| `-u`, `--user`    | _Optional_   | `String` |

#### Examples

-   Comment on a pull request.

```
gh pr 1 --comment "Merged, thank you!"
```

### 6. Forward

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `--fwd`          | **Required** | `String` |
| `-n`, `--number` | **Required** | `Number` |

Omitting a value for `--fwd` fallbacks to the `default_pr_forwarder` key found
in your [config file](#config).

#### Examples

-   Forward a pull request to another reviewer.

```
gh pr 1 --fwd username
```

### 7. Open or close

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-o`, `--open`   | **Required** | `Boolean` |
| `-C`, `--close`  | **Required** | `Boolean` |
| `-n`, `--number` | **Required** | `Number`  |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |

#### Examples

-   Open a pull request.

```
gh pr 1 --open
```

-   Close a pull request.

```
gh pr 1 --close
```

-   Close multiple pull requests.

```
gh pr --close --number 1 --number 2
```

-   Open multiple pull requests.

```
gh pr --open --number 1 --number 2
```

-   Open or close a pull request that you've sent to someone.

```
gh pr 1 --close --user eduardolundgren
```

### 8. Submit

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

-   Submit a pull request using the current branch.

```
gh pr --submit eduardolundgren --title 'Fix #32' --description 'Awesome fix'
```

-   Submit a pull request using the current branch to dev branch.

```
gh pr --submit eduardolundgren --branch dev
```

-   Submit a pull request from a issue.

```
gh pr --submit eduardolundgren --issue 150
```

-   Submit a pull request in draft state.

```
gh pr --submit eduardolundgren --draft
```

### 9. Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-n`, `--number`  | **Required** | `Number`  |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-r`, `--repo`    | _Optional_   | `String`  |

#### Examples

-   Open GitHub pull request page in the browser.

```
gh pr 100 --browser
```

## Notifications

```
gh notification
```

> **Alias:** `gh nt`

### 1. Latest

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-l`, `--latest` | **Required** | `Boolean` |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |
| `--date`         | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for displaying the latest activities on the current repository.

```
gh nt
```

-   Display the latest activities on a certain repository.

```
gh nt --latest --user eduardolundgren --repo node-gh
```

-   Diplay notifications with a formatted date (_Any string that the moment library's formatter accepts should work: https://momentjs.com/docs/#/displaying/format/_).

```
gh nt --date "dddd, MMMM Do YYYY, h:mm:ss a"
```

### 2. Watch

| Option          | Usage        | Type      |
| --------------- | ------------ | --------- |
| `-w`, `--watch` | **Required** | `Boolean` |
| `--remote`      | _Optional_   | `String`  |
| `-r`, `--repo`  | _Optional_   | `String`  |
| `-u`, `--user`  | _Optional_   | `String`  |

#### Examples

-   Watch for any activity on the current repository.

```
gh nt --watch
```

-   Watch for any activity on a certain repository.

```
gh nt --watch --user eduardolundgren --repo node-gh
```

## Issues

```
gh issue
```

> **Alias:** `gh is`

### 1. Create

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

-   **Shortcut** for creating a new issue on the current repository.

```
gh is 'Node GH rocks!' 'Body with **Markdown** support'
```

-   Create a new issue on a certain repository.

```
gh is --new --title 'Node GH rocks!' --message 'Body with **Markdown** support' --user eduardolundgren --repo node-gh
```

-   Create a new issue with labels.

```
gh is --new --title 'Node GH rocks!' --labels bug,question,test
```

-   Create a new issue and assign it to someone.

```
gh is --new --title 'Node GH rocks!' --assignee zenorocha
```

### 2. Comment

| Option            | Usage        | Type     |
| ----------------- | ------------ | -------- |
| `-c`, `--comment` | **Required** | `String` |
| `-n`, `--number`  | **Required** | `Number` |
| `--remote`        | _Optional_   | `String` |
| `-r`, `--repo`    | _Optional_   | `String` |
| `-u`, `--user`    | _Optional_   | `String` |

#### Examples

-   Comment on an issue of the current repository.

```
gh is 1 --comment 'Node GH rocks!'
```

-   Comment on an issue of a certain repository.

```
gh is 1 --comment 'Node GH rocks!' --user eduardolundgren --repo node-gh
```

### 3. Open or close

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-o`, `--open`   | **Required** | `Boolean` |
| `-C`, `--close`  | **Required** | `Boolean` |
| `-n`, `--number` | **Required** | `Number`  |
| `--remote`       | _Optional_   | `String`  |
| `-r`, `--repo`   | _Optional_   | `String`  |
| `-u`, `--user`   | _Optional_   | `String`  |

#### Examples

-   Open an issue.

```
gh is 1 --open
```

-   Close an issue.

```
gh is 1 --close
```

-   Close multiple issues.

```
gh is --close --number 1 --number 2
```

-   Open multiple issues.

```
gh is --open --number 1 --number 2
```

-   Open or close an issue that you've sent to someone.

```
gh is 1 --close --user eduardolundgren
```

### 4. List

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

#### Examples

-   **Shortcut** for listing all issues on the current repository.

```
gh is
```

-   List all issues from all repositories.

```
gh is --list --all
```

-   List issues assigned to someone.

```
gh is --list --assignee zenorocha
```

-   List issues with link and content.

```
gh is --list --detailed
```

-   List only closed issues on the current repository.

```
gh is --list --state closed
```

-   List issues with a formatted date (_Any string that the moment library's formatter accepts should work: https://momentjs.com/docs/#/displaying/format/_).

```
gh is --list --date "dddd, MMMM Do YYYY, h:mm:ss a"
```

-   List issues filtered by milestone.

```
gh is --list --milestone 1
```

-   List issues that contains labels `todo` and `bug`.

```
gh is --list --labels todo,bug
```

-   List all issues on a certain repository.

```
gh is --list --user eduardolundgren --repo node-gh
```

### 5. Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-n`, `--number`  | **Required** | `Number`  |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-r`, `--repo`    | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for opening GitHub issue page in the browser.

```
gh is 100
```

-   Open GitHub issue page in the browser.

```
gh is 100 --browser
```

### 6. Search

| Option             | Usage        | Type      |
| ------------------ | ------------ | --------- |
| `-s`, `--search`   | **Required** | `Boolean` |
| `-a`, `--all`      | _Optional_   | `Boolean` |
| `-d`, `--detailed` | _Optional_   | `Boolean` |
| `-r`, `--repo`     | _Optional_   | `String`  |
| `-u`, `--user`     | _Optional_   | `String`  |

#### Examples

-   Search issues in current repository

```
gh is --search 'term'
```

-   Search issues in all repositories for a user

```
gh is --all --user node-gh --search 'term'
```

-   Search issues in a repository for a user

```
gh is  --user node-gh --repo gh --search 'term'
```

-   Search issues in a repository for a user with link and content

```
gh is  --user node-gh --repo gh --search 'term'
```

-   Search issues with github filters

```
gh is  --user node-gh --repo gh --search 'updated:<=2013-05-24'
```

### 7. Assign

| Option             | Usage        | Type      |
| ------------------ | ------------ | --------- |
| `--assign`         | **Required** | `Boolean` |
| `-A`, `--assignee` | **Required** | `String`  |
| `-n`, `--number`   | **Required** | `Number`  |
| `-r`, `--repo`     | _Optional_   | `String`  |
| `-u`, `--user`     | _Optional_   | `String`  |

#### Examples

-   Assign an issue on the current repository to a user.

```
gh is --assign --assignee zenorocha --number 1
```

-   Assign an issue on a specific repository to a user.

```
gh is --assign --assignee zenorocha --number 1 --user eduardolundgren --repo gh
```

## Repo

```
gh repo
```

> **Alias:** `gh re`

### 1. Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-r`, `--repo`    | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for opening the GitHub repository page in the browser.

```
gh re
```

-   Open GitHub repository page in the browser.

```
gh re --browser --user eduardolundgren --repo node-gh
```

### 2. List

| Option             | Usage        | Type                                            |
| ------------------ | ------------ | ----------------------------------------------- |
| `-l`, `--list`     | **Required** | `Boolean`                                       |
| `-d`, `--detailed` | _Optional_   | `Boolean`                                       |
| `-u`, `--user`     | _Optional_   | `String`                                        |
| `-t`, `--type`     | _Optional_   | [`all`, `owner`, `public`, `private`, `member`] |
| `--date`           | _Optional_   | `String`                                        |

#### Examples

-   List all repositories.

```
gh re --list
```

-   List all private repositories.

```
gh re --list --type private
```

-   List all repositories from someone.

```
gh re --list --user zenorocha
```

-   List open repositories with a formatted date (_Any string that the moment library's formatter accepts should work: https://momentjs.com/docs/#/displaying/format/_).

```
gh re --list --detailed --date "dddd, MMMM Do YYYY, h:mm:ss a"
```

### 3. Create

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

-   Create a new GitHub repository and clone on the current directory.

```
gh re --new foo --clone
```

-   Create a new GitHub repository for an organization.

```
gh re --new foo --organization node-gh
```

-   Create a new GitHub repository using .gitignore template for Ruby.

```
gh re --new gemified --gitignore Ruby
```

-   Create a new private repository on GitHub, initializing it with a initial commit of the README.

```
gh re --new foo --init --type private
```

### 4. Fork

| Option                 | Usage        | Type     |
| ---------------------- | ------------ | -------- |
| `-f`, `--fork`         | **Required** | `String` |
| `-u`, `--user`         | **Required** | `String` |
| `-O`, `--organization` | _Optional_   | `String` |

#### Examples

-   Fork a GitHub repository.

```
gh re --fork repo --user user
```

-   Fork a GitHub repository into the node-gh organization.

```
gh re --fork repo --user user --organization node-gh
```

### 5. Delete

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `-D`, `--delete` | **Required** | `String` |
| `-u`, `--user`   | **Required** | `String` |

#### Example

-   Delete a repository of the logged user.

```
gh re --delete foo
```

### 6. Clone

| Option                 | Usage        | Type     |
| ---------------------- | ------------ | -------- |
| `-c`, `--clone`        | **Required** | `String` |
| `-r`, `--repo`         | **Required** | `String` |
| `-O`, `--organization` | _Optional_   | `String` |
| `-P`, `--protocol`     | _Optional_   | `String` |
| `-u`, `--user`         | _Optional_   | `String` |

> If you have custom ssh config, you can add `"api": { "ssh_host": "custom-name", ... }` to your .gh.json file.

#### Examples

-   Clone a repository.

```
gh re --clone --repo gh
```

-   Clone a repository from a specific user using HTTPS protocol.

```
gh re --clone --user eduardolundgren --repo gh --protocol https
```

### 7. Create Label

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-C`, `--color`        | **Required** | `String`  |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-N`, `--new`          | **Required** | `String`  |
| `-r`, `--repo`         | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

-   Create a label for a repository (_color is a hex code with or without literal hex symbol_).

```
gh re --label --new bug --color '#7057ff' --repo gh
```

-   Create a label for a user's repository.

```
gh re --label --new bug --color '#7057ff' --user eduardolundgren --repo gh
```

### 8. Delete Label

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-D`, `--delete`       | **Required** | `String`  |
| `-r`, `--repo`         | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

-   Delete a label from a repository.

```
gh re --label --delete bug --repo gh
```

-   Delete a label from a user's repository.

```
gh re --label --delete bug --user eduardolundgren --repo gh
```

### 9. List Labels

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-l`, `--list`         | **Required** | `Boolean` |
| `-r`, `--repo`         | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

-   List labels for a repository.

```
gh re --label --list --repo gh
```

-   List labels for a user's repository.

```
gh re --label --list --user eduardolundgren --repo gh
```

### 10. Update Label

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-C`, `--color`        | **Required** | `String`  |
| `-L`, `--label`        | **Required** | `Boolean` |
| `-r`, `--repo`         | **Required** | `String`  |
| `-U`, `--update`       | **Required** | `String`  |
| `-O`, `--organization` | _Optional_   | `String`  |
| `-u`, `--user`         | _Optional_   | `String`  |

#### Examples

-   Update a label for a repository (_color is a hex code with or without literal hex symbol_).

```
gh re --label --update bug --color color --repo gh
```

-   Update a label for a user's repository.

```
gh re --label --update bug --color color --user eduardolundgren --repo gh
```

## Gists

```
gh gists
```

> **Alias:** `gh gi`

### 1. Open in Browser

| Option            | Usage        | Type      |
| ----------------- | ------------ | --------- |
| `-B`, `--browser` | **Required** | `Boolean` |
| `-u`, `--user`    | _Optional_   | `String`  |
| `-i`, `--id`      | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for opening your Gists in the browser.

```
gh gi
```

-   Open a Gist in the browser.

```
gh gi --browser --id 5991877
```

### 2. List

| Option         | Usage        | Type      |
| -------------- | ------------ | --------- |
| `-l`, `--list` | **Required** | `Boolean` |
| `-u`, `--user` | _Optional_   | `String`  |
| `--date`       | _Optional_   | `String`  |

#### Examples

-   List all gists.

```
gh gi --list
```

-   List all gists from someone.

```
gh gi --list --user brunocoelho
```

-   List gists with a formatted date (_Any string that the moment library's formatter accepts should work: https://momentjs.com/docs/#/displaying/format/_).

```
gh gi --list --date "dddd, MMMM Do YYYY, h:mm:ss a"
```

### 3. Create

| Option                | Usage        | Type      |
| --------------------- | ------------ | --------- |
| `-N`, `--new`         | **Required** | `String`  |
| `-c`, `--content`     | _Optional_   | `String`  |
| `-d`, `--description` | _Optional_   | `String`  |
| `-p`, `--private`     | _Optional_   | `Boolean` |

#### Examples

-   Create a Gist `hello` containing "Hello World".

```
gh gi --new hello --content "Hello World!"
```

-   Create a private Gist `hello` containing "Hello World".

```
gh gi --new hello --content "Hello World!" --private
```

### 4. Fork

| Option         | Usage        | Type     |
| -------------- | ------------ | -------- |
| `-f`, `--fork` | **Required** | `String` |

#### Examples

-   Fork a Gist.

```
gh gi --fork 5444883
```

### 5. Delete

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `-D`, `--delete` | **Required** | `String` |

#### Example

-   Delete a Gist.

```
gh gi --delete 4252323
```

-   Delete multiple Gists.

```
gh gi --delete 4252321 --delete 4252322
```

## User

```
gh user
```

> **Alias:** `gh us`

### 1. Login/Logout

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-l`, `--login`  | **Required** | `Boolean` |
| `-L`, `--logout` | **Required** | `Boolean` |

#### Examples

-   Login or show current logged in GitHub user.

```
gh user --login
```

-   Logout current GitHub account.

```
gh user --logout
```

### 2. Whoami

| Option           | Usage        | Type      |
| ---------------- | ------------ | --------- |
| `-w`, `--whoami` | **Required** | `Boolean` |

#### Examples

-   Prints your username to stdout.

```
gh user --whoami
```

## Milestones

```
gh milestone
```

> **Alias:** `gh ms`

### 1. List

| Option                 | Usage        | Type      |
| ---------------------- | ------------ | --------- |
| `-l`, `--list`         | **Required** | `Boolean` |
| `-u`, `--user`         | _Required_   | `String`  |
| `-a`, `--all`          | _Required_   | `Boolean` |
| `-r`, `--repo`         | _Optional_   | `String`  |
| `-o`, `--organization` | _Optional_   | `String`  |

#### Examples

-   **Shortcut** for listing milestones for a specific repo.

```
gh ms
```

-   Listing milestones for a specific repo & user.

```
gh ms --list --user node-gh --repo gh
```

-   Listing all milestones for a specific organization.

```
gh ms --list --all --organization node-gh
```

## Alias

This cmd provides something similar to shell aliases. If there are aliases in your .gh.json file, we will attempt to resolve the user, PR forwarder or PR submitter to your alias.

```
gh alias
```

> **Alias:** `gh al`

### 1. List

| Option         | Usage        | Type      |
| -------------- | ------------ | --------- |
| `-l`, `--list` | **Required** | `Boolean` |

#### Examples

-   **Shortcut** for listing aliases.

```
gh alias
```

-   List aliases.

```
gh alias --list
```

### 2. Add

| Option         | Usage        | Type     |
| -------------- | ------------ | -------- |
| `-a`, `--add`  | **Required** | `String` |
| `-u`, `--user` | **Required** | `String` |

#### Examples

-   Create alias for username.

```
gh alias --add zeno --user zenorocha
```

### 3. Remove

| Option           | Usage        | Type     |
| ---------------- | ------------ | -------- |
| `-r`, `--remove` | **Required** | `String` |

#### Examples

-   Remove alias.

```
gh alias --remove zeno
```

## Config

There are some pretty useful configurations that you can set on [.gh.json](default.gh.json).
This file can be found under home directory _(on MacOSx: `/Users/yourName/.gh.json` on Windows: `C:\\Users\yourName\.gh.json`)_.

You can also set per-project configurations by adding a `.gh.json` file in your project's root folder and overriding existing keys.

-   GitHub API configurations. Change it if you're a [GitHub Enterprise](https://enterprise.github.com/) user.

```javascript
"api": {
    "host": "github.mydomain.com",
    "protocol": "https"
}
```

-   Set default branch and remote.

```javascript
"default_branch": "master",
"default_remote": "origin"
```

-   Set default users when [submitting](#7-submit) or [forwarding](#5-forward) pull requests.

```javascript
"default_pr_forwarder": "",
"default_pr_reviewer": ""
```

-   GitHub data filled once you log in.

```javascript
"github_token": "",
"github_user": ""
```

-   Run automated tasks before or after a certain command.

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

-   Run automated tasks passing arguments to the commands. Required for prompt commands.

```javascript
"hooks": {
        "pull-request": {
            "merge": {
                "before": [{"cmd": "foo", "args": ["bar", "qux"]}]
            }
        }
}
```

-   Set default branch name prefix for PR fetching.

```javascript
"pull_branch_name_prefix": "pr-"
```

-   Insert signature below issue comment.

```javascript
"signature": "<br><br>:octocat: *Sent from [GH](http://nodegh.io).*"
```

-   Turn off ssh when pulling a repo and use https instead.

```javascript
"ssh": false,
```

If you need to use a custom git command, set the environment variable `GH_GIT_COMMAND`.

## Plugins

-   [GH Gif](https://github.com/node-gh/gh-gif) - A plugin for commenting on pull requests/issues using GIF reactions.
-   [GH Travis](https://github.com/node-gh/gh-travis) - A plugin for integrating Travis, a continous integration server.
-   [GH Jira](https://github.com/node-gh/gh-jira) - A plugin for integrating Jira, an issue management system.

Feel free to create your own plugins by forking [GH Boilerplate](https://github.com/node-gh/gh-boilerplate).
