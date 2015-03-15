#!/bin/bash

if [ "${TRAVIS_REPO_SLUG}" != "node-gh/gh" ]; then
    echo "Skipping report publishing: not in the gh repo slug.">&2
    exit
fi;

if [ "${TRAVIS_PULL_REQUEST}" != "false" ]; then
    echo "Skipping report publishing: in a pull request.">&2
    exit
fi;

if [ "${TRAVIS_OS_NAME}" != "linux" ]; then
    echo "Skipping report publishing: not in Linux.">&2
    exit
fi;

if [ "${TRAVIS_BRANCH}" != "master" ]; then
    echo "Skipping report publishing: not in the master branch.">&2
    exit
fi;

if [ `echo $TRAVIS_JOB_NUMBER | cut -d '.' -f 2` != "1" ]; then
    echo "Skipping report publishing: not the job #1.">&2
    exit
fi;

COMMIT_MSG="Source code report for $TRAVIS_REPO_SLUG@$TRAVIS_COMMIT $TRAVIS_TAG"

(
    echo $COMMIT_MSG
    echo Revision: $TRAVIS_COMMIT \($TRAVIS_BRANCH\) $TRAVIS_TAG
    echo Date: `date`
    echo https://travis-ci.org/node-gh/gh/jobs/$TRAVIS_JOB_ID
    echo
    echo Travis Build ID: $TRAVIS_BUILD_ID
    echo Travis Build number: $TRAVIS_BUILD_NUMBER
    echo Travis Job ID: $TRAVIS_JOB_ID
    echo Travis Job Number: $TRAVIS_JOB_NUMBER
    echo Travis repo slug: $TRAVIS_REPO_SLUG
    echo
    echo `uname -a`
    echo
    echo node `node --version`
    echo npm `npm --version`
    echo
)  2>&1 | tee reports/report

cd reports

if [ `basename $(pwd)` != "reports" ]; then
    echo Not inside the reports directory.>&2
    exit 1
fi;

git config --global push.default simple
git config --global user.email "octocat@nodegh.io"
git config --global user.name "gh octocat"
git add .
git commit -m "$COMMIT_MSG"
git push
