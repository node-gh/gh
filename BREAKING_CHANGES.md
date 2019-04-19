# Version 2.0.0 Breaking Changes

## Features

-   Upgrade to latest GitHub rest endpoints

### Node Versions

-   Dropped support for v6
-   Only Supporting >= v8

### House Cleaning

-   Removed `alias` cmd as aliases are better suited to be implemented at the shell level like in your `.zshrc` or `.bashrc`
-   Unwind callback hell into simple async await control flows
-   Updated error handling
-   Clearer logging messages
-   Deeper end to end test coverage of critical code paths like authentication
-   Remove gist paste deprecation warning

### Issues

-   `--label` flag is now `--labels`
