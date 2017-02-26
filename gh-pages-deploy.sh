#!/bin/bash

set -e

rm -rf dist
cp -r app dist
find dist -type f -name "*_test.js" -delete
git add dist && git commit dist -m 'deploy to gh-pages dir'
# https://gist.github.com/cobyism/4730490
git subtree push --prefix dist origin gh-pages
