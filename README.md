# node-gh

Github command line tools helps you improve using Git and Github from the terminal.

![Class Octocat](http://cl.ly/image/2x1Z2j3K2X3d/class-octocat.jpg)

## Usage

    gh  [command] [payload] [--flags]

## Install

    npm install -g gh

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

#### Fetching

* Fetch pull request and checkout into a new branch.

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

* Fetch all open pull requests. *(TODO)*

    ```
gh pr --fetch-all [-?]
    ```

#### Merging or rebasing

* Merge or rebase pull request into a branch.

    ```
gh pr --merge [--pull 1] [--branch master]
    ```

    ```
gh pr --rebase [--pull 1] [--branch master]
    ```

* Omitting `--pull` will try to guess the pull number from branch name e.g. `pull-1` results in `--pull 1`.
* Omitting `--branch` will merge or rebase into `config.defaultbranch`.

#### Commenting

* Comment in a pull request.

    ```
gh pr --pull 1 --comment "Merged, thank you!".
    ```

#### Forwarding

* Forward a pull request to another reviewer. *(TODO)*

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