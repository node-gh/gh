# Version 2.0.0 Breaking Changes

## Features

-   Upgrade to latest GitHub rest endpoints

### Node Versions

-   Dropped support for v6
-   Only Supporting >= v8

### Issues

-   `--label` flag is now `--labels`

### Milestons

-   Stabilize milestones listing implementation

### Pull Requests

-   New list table view by default
-   Add line breaks between repos when listing pull requests
-   Include "merge" hook in "fetch" hook
-   Remove undocumented code that will do a local git merge

### House Cleaning

-   Removed `alias` cmd as aliases are better suited to be implemented at the shell level like in your `.zshrc` or `.bashrc`
-   Unwind callback hell into simple async await control flows
-   Updated error handling
-   Clearer logging messages
-   Deeper end to end test coverage of critical code paths like authentication
-   Remove gist paste deprecation warning
