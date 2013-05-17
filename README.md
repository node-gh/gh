node-gh
=======

Github command line tools helps you improve using git and github from the terminal.

## Usage

    gh  [command] [payload] [--flags]


## Available commands

### Pull requests

#### Listing

* List open pulls requests for the current branch.

    ```
gh pr --list
    ```

* List open pulls requests for all branches.

    ```
gh pr --list --all
    ```

* List open pulls requests for a branch.

    ```
gh pr --list --branch master
    ```

#### Fecthing

* Fech pull request and checkout into a new branch.

    ```
gh pr --pull 1 --fetch --branch new_branch
    ```

* Fech pull request, rebasing or merging, into a branch. When `--branch` is not specified uses the current branch.

    ```
gh pr --pull 1 --fetch --rebase [--branch master]
    ```
    ```
gh pr --pull 1 --fetch --merge [--branch master]
    ```

* Fetch all open pull requests. (TODO)

    ```
gh pr --fetch-all [-?]
    ```

#### Commenting

* Comment in a pull request.

    ```
gh pr --pull 1 --comment "Merged, thank you!".
    ```

#### Forwarding

* Forward a pull request to another reviewer. (TODO)

    ```
gh pr --pull 1 --fwd username
    ```

#### Open and close

* Close a pull request.

    ```
gh pr --pull 1 --open
    ```

    ```
gh pr --pull 1 --close
    ```

#### Submiting

* Submit a pull request.

    ```
gh pr --submit eduardolundgren
    ```