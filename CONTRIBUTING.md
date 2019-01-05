-   [Reporting Bugs](#reporting-bugs)
-   [Writing Code](#writing-code)
    -   [Committing](#committing)
    -   [Building](#building)
    -   [Adding new commands](#adding-new-commands)
-   [Testing](#testing)
    -   [Optional Plugins to install for your code editor for a better developer experience](#optional-plugins-to-install-for-your-code-editor-for-a-better-developer-experience)
        -   [Prettier](#prettier)
        -   [TSlint (linter)](#tslint-linter)

## Reporting Bugs

1.  Verify if your problem is already solved on the latest version
2.  Search for open issues before opening a new one
3.  Specify what version you're using `gh --version`
4.  Print the output of `npm list -g --depth=0 | grep gh`
5.  Try the command that failed with `--verbose` to print debugging messages
6.  Report the exit code of the gh process: `echo $?` after termination

## Writing Code

### Committing

1.  Remove the installed version from NPM: `[sudo] npm rm -g gh`
2.  Fork the project and clone it locally: `git clone git@github.com:<your-username>/gh.git`
3.  Go to the package folder and create a symlink: `[sudo] npm link`
4.  Then you can run commands normally `gh ...`
5.  To commit run `npm run commit` which will take you through a nice interactive semantic commit process

-   If you want more info on the commit process, we follow [Angular's Commit Convention](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular#readme)

### Building

Since this is a **TypeScript** project, we have to compile the code before running it.

First, if you haven't already done so, install dependencies and create a sym link:

-   `npm install`
-   `[sudo] npm link`

To run **incrementally** in watch mode:

-   `npm run dev`

To run **once**:

-   `npm run build`

### Adding new commands

-   Copy and edit the content of [Hello World](https://github.com/node-gh/gh/blob/master/src/cmds/hello.ts) example
-   Add instructions in [README](https://github.com/node-gh/gh/blob/master/README.md)

## Testing

Please verify that your tests pass & minimum coverage levels are met when contributing code:

-   `npm test` Run all tests
-   `npm run test:watch` Run all tests in watch mode
-   `npm run test:coverage` Run all tests with coverage

### Optional Plugins to install for your code editor for a better developer experience

-   Even if you don't install these plugins, your commits will automatically be formatted

#### Prettier

> Prettier is an opinionated code formatter

-   [User Guide](https://prettier.io/)
-   [Editor plugin links](https://prettier.io/docs/en/editors.html)

#### TSlint (linter)

> TSlint is a pluggable linting utility for TypeScript

-   [User Guide](https://palantir.github.io/tslint/)
-   [Editor plugin links](https://palantir.github.io/tslint/usage/third-party-tools)
