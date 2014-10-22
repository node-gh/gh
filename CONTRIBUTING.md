# Contributing

If you want to fix bugs or add new features you'll need to run in development environment.

1. Remove the installed version from NPM: `[sudo] npm rm -g gh`
2. Fork the project and clone it locally: `git clone git@github.com:<your-username>/gh.git`
3. Go to the package folder and create a symlink: `[sudo] npm link`

Contribute new commands to this project by copying and editing the content of [Hello World](https://github.com/node-gh/gh/blob/master/lib/cmds/hello.js) example.
