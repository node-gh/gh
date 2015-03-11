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
