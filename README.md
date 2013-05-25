# node-gh [![Build Status](https://secure.travis-ci.org/eduardolundgren/node-gh.png?branch=master)](https://travis-ci.org/eduardolundgren/node-gh)

Github command line tools helps you improve using Git and Github from the terminal.

![Class Octocat](http://eduardolundgren.github.io/node-gh/images/class-octocat.jpg)

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

### Notification

* Display the latest activities on the current repository.

    ```
gh nt --latest
    ```

* Watch for any activity on the current repository.

    ```
gh nt --watch
    ```

## Team

[![Eduardo Lundgren](http://gravatar.com/avatar/42327de520e674a6d1686845b30778d0?s=70)](https://github.com/eduardolundgren/) | [![Zeno Rocha](http://gravatar.com/avatar/e190023b66e2b8aa73a842b106920c93?s=70)](https://github.com/zenorocha/)
--- | ---
[Eduardo Lundgren](https://github.com/eduardolundgren/) | [Zeno Rocha](https://github.com/zenorocha/)

## History

* **v0.0.7** May 24, 2013
	* Create a new website under gh-pages branch
	* Update dependency version: git-wrapper@0.1.1
	* Add Hello World and Notification tasks
* **v0.0.6** May 17, 2013
	* Add hability to merge or rebase pull request
	* Add base.getUser and git.merge helpers
* **v0.0.5** May 16, 2013
	* Add login to be invoked by default in series
* **v0.0.4** May 16, 2013
	* Create ~/.gh.json if needed
* **v0.0.3** May 16, 2013
	* Merge user ~/.gh.json with default .gh.json
	* Add default .gh.json
	* Fix bin path
* **v0.0.2** May 16, 2013
	* Add fetch, open/close, comment
	* Use moment humanize utility
* **v0.0.1** May 14, 2013
	* Initial commit

## License

[BSD License](https://github.com/eduardolundgren/node-gh/blob/master/README.md)