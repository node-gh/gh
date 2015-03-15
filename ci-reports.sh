#!/bin/bash

(
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
    echo `node -e 'console.log(process.versions);'`
    echo
)  2>&1 | tee report

if [ "${TRAVIS_REPO_SLUG}" != "node-gh/gh" ]; then
    echo "Jumping report publishing. Not in the gh repo slug.">&2
    exit
fi;

if [ "${TRAVIS_PULL_REQUEST}" != "false" ]; then
    echo "Jumping report publishing. In a pull request.">&2
    exit
fi;

if [ "${TRAVIS_OS_NAME}" != "linux" ]; then
    echo "Jumping report publishing. Not in Linux.">&2
    exit
fi;

if [ "${TRAVIS_BRANCH}" != "master" ]; then
    echo "Jumping report publishing. Not in the master branch.">&2
    exit
fi;

if [ `echo $TRAVIS_JOB_NUMBER | cut -d '.' -f 2` != "1" ]; then
    echo "Jumping report publishing. Not the first job.">&2
    exit
fi;

if [ -d "reports" ]; then
    mv reports current-reports
else
    echo Reports not generated.
    exit 1
fi;

git clone git@github.com:node-gh/reports.git

if [ ! -d "reports" ]; then
    echo Reports directory not created after git clone. Exiting.
    exit 1
fi;

mv report reports

if [ -d "current-reports" ]; then
    mv current-reports/* reports
fi;

cd reports

REPORTS_NAME=`basename $(pwd)`

if [ "${REPORTS_NAME}" != "reports" ]; then
    echo Reports directory not found.
    exit 1
fi;

git config --global user.email "octocat@nodegh.io"
git config --global user.name "gh octocat"
git add .
git commit -m "Source code report for node-gh/gh/$TRAVIS_COMMIT"
git push
