#!/bin/bash

set -e`

rm -rf dist
cp -r app dist
find dist -type f -name "*_test.js" -delete
`