#!/bin/bash
echo "Building at [$(date)]"
tsc;
browserify dist/entry.js -o dist/bundle.js;
lessc src/styles.less dist/style.css
echo "Build Complete at [$(date)]"