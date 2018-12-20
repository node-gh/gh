- [Reporting Bugs](#reporting-bugs)
- [Testing](#testing)
- [Committing](#committing)
  - [Optional Plugins to install for your code editor](#optional-plugins-to-install-for-your-code-editor)
    - [Prettier (formatter primarily for JS files)](#prettier-formatter-primarily-for-js-files)
    - [ESlint (linter)](#eslint-linter)

## Reporting Bugs

1.  Verify if your problem is already solved on the latest version
2.  Search for open issues before opening a new one
3.  Specify what version you're using `gh --version`
4.  Print the output of `npm list -g --depth=0 | grep gh`
5.  Try the command that failed with `--verbose` to print debugging messages
6.  Report the exit code of the gh process: `echo $?` after termination

## Testing

Please verify that your tests pass & minimum coverage levels are met when contributing code:

-   `npm test` Run all tests
-   `npm run test:watch` Run all tests in watch mode
-   `npm run test:coverage` Run all tests with coverage

## Committing

1.  Remove the installed version from NPM: `[sudo] npm rm -g gh`
2.  Fork the project and clone it locally: `git clone git@github.com:<your-username>/gh.git`
3.  Go to the package folder and create a symlink: `[sudo] npm link`
4.  Then you can run commands normally `gh ...`
5.  To commit run `npm run commit` which will take you through a nice interactive semantic commit process

-   If you want more info on the commit process, we follow [Angular's Commit Convention](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular#readme)

Contribute new commands to this project by copying and editing the content of [Hello World](https://github.com/node-gh/gh/blob/master/lib/cmds/hello.js) example.

### Optional Plugins to install for your code editor

-   Even if you don't install these plugins, your commits will automatically be formatted
-   These are only recommendations for a better developer experience

#### Prettier (formatter primarily for JS files)

> Prettier is an opinionated code formatter. https://prettier.io/playground/

-   User Guide: https://github.com/prettier/prettier
-   VS Code Editor Plugin: https://github.com/prettier/prettier-vscode
-   Vim Plugin: https://github.com/prettier/vim-prettier
-   Sublime: https://packagecontrol.io/packages/JsPrettier

#### ESlint (linter)

> ESlint is a pluggable linting utility for JavaScript

-   User Guide: https://eslint.org/docs/user-guide/getting-started#configuration
-   VS Code Editor Plugin: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
-   Vim Plugin: https://github.com/vim-syntastic/syntastic/tree/master/syntax_checkers/javascript
-   Sublime: https://github.com/roadhump/SublimeLinter-eslint
