# Version 2.0.0 Breaking Changes

## Features

-   Add pagination to list endpoints
-   Upgrade to latest GitHub rest endpoints
-   Add throttling Octokit plugin that uses best practices to prevent hitting rate limits
-   Increase reliability through more robust testing suite
-   Clearer delineation between before & after hooks

### Node Versions

-   Dropped support for v6
-   Only Supporting >= v8

### Issues

-   `--label` flag is now `--labels`
-   Clearer delineation between repos when listing

### Milestons

-   Stabilize milestones listing implementation

### Pull Requests

-   New list table view by default
-   Add line breaks between repos when listing pull requests
-   Include "merge" hook in "fetch" hook
-   Remove undocumented code that will do a local git merge

### Hooks

-   Merge plugin hooks to .gh.json file only upon first run of plugin
-   Hooks will now always be managed through the .gh.json file
-   Renamed generic hook log from [hook] to {after-hook} & {before-hook}

### House Cleaning

-   Removed `alias` cmd as aliases are better suited to be implemented at the shell level like in your `.zshrc` or `.bashrc`
-   Unwind callback hell into simple async await control flows
-   Updated error handling
-   Clearer logging messages
-   Deeper end to end test coverage of critical code paths like authentication
-   Remove gist paste deprecation warning
-   Simplify the hooks flow
