#!/bin/bash
# This script create the archive for Chrome Store upload

# create the directory
EXT_DIR="chrome_archive"
ZIP_FILE="ext_chrome.zip"
mkdir ${EXT_DIR}
echo "$EXT_DIR created"

# copy the files

cp manifest.json ${EXT_DIR}
cp content.js ${EXT_DIR}
cp ext_style.css ${EXT_DIR}

# compress zip file
zip -r ${ZIP_FILE}  ${EXT_DIR}

# delete directory
rm -r ${EXT_DIR}

echo "$ZIP_FILE created"
