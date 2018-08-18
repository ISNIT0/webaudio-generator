#!/bin/bash
echo "Building at [$(date)]"
browserify src/entry.js -o dist/app.js;
lessc src/styles.less dist/style.css
echo "Build Complete at [$(date)]"