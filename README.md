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
gh pr --list [-l]
	```

* List open pulls requests for all branches.

	```
gh pr --list [-l] --all [-a]
	```

* List open pulls requests for a branch.

	```
gh pr --list [-l] --branch [-b] master
	```

#### Fecthing

* Fech pull request and checkout into a new branch.

	```
gh pr --pull [-p] 1 --fetch [-f] [-b new_branch]
	```
	
* Fech pull request, rebasing or merging, into a branch. When `--branch` is not specified uses the current branch.

	```
gh pr --pull [-p] 1 --fetch [-f] --rebase [-r] [-b master]
	```
	```
gh pr --pull [-p] 1 --fetch [-f] --merge [-m] [-b master]
	```

* Fetch all open pull requests.

	```
gh pr --fetch-all [-?]
	```

#### Commenting
	
* Comment in a pull request.

	```
gh pr --pull [p] 1 --comment [-c] "Merged, thank you!".
	```	
	
#### Forwarding

* Forward a pull request to another reviewer.

	```
gh pr --pull [-p] 1 --fwd [-?] username
	```
	
#### Open and close

* Close a pull request.

	```
gh pr --pull [-p] 1 --open [-o]
	```

	```
gh pr --pull [-p] 1 --close [-c]
	```

#### Submiting

	```
gh pr --submit [-s] --user eduardo
	```