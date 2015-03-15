# Contributing

## If you're reporting a bug

1. Verify if your problem is already solved on the latest version
2. Search for open issues before opening a new one
3. Specify what version you're using `gh --version`
4. Print the output of `npm list -g --depth=0 | grep gh`
5. Try the command that failed with `--verbose` to print debugging messages
6. Report the exit code of the gh process: `echo $?` after termination

## If you want to fix bugs or add new features you'll need to run in development environment.

1. Remove the installed version from NPM: `[sudo] npm rm -g gh`
2. Fork the project and clone it locally: `git clone git@github.com:<your-username>/gh.git`
3. Go to the package folder and create a symlink: `[sudo] npm link`

Contribute new commands to this project by copying and editing the content of [Hello World](https://github.com/node-gh/gh/blob/master/lib/cmds/hello.js) example.

## [NodeGH](nodegh.io) source code reports
Please verify the following reports when contributing code.

* [Code coverage](https://node-gh.github.io/reports/coverage/lcov-report/index.html)
* [Static analysis & code complexity](https://node-gh.github.io/reports/complexity/)

***Report is generated for the master branch by a Travis CI hook.***

### Details

The static analysis ([plato](https://github.com/es-analysis/plato)) has historical data. If you want to retrieve them, the better approach is to clone [node-gh/reports.git](https://github.com/node-gh/reports) inside your gh repo so you can compare to see what your modifications does to the code base.

The reports are published to gh-pages from Travis with a private deploy key that only works for that repo (for security reasons) and is invoked by the Travis after_success hook [ci-reports.sh](https://github.com/node-gh/gh/blob/master/ci-reports.sh) and, also, only for the first job on a build (so that it only runs against the current stable node version) on the master branch of [node-gh/gh](https://travis-ci.org/node-gh/gh).

Disclaimer: having a git repo inside another can get you a little confused when you forget about it.
