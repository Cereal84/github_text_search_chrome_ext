#!/bin/bash
# This script create the archive for Chrome Store upload

# create the directory
EXT_DIR="chrome_archive"
ZIP_FILE="ext_chrome.zip"
mkdir ${EXT_DIR}
echo "$EXT_DIR created"

# copy the files
ext_files=(
    "manifest.json"
    "content.js"
    "ext_style.css"
    "popup.html"
    "popup.js"
    "background.js");

for i in ${ext_files[@]}; do
     echo $i
     cp ${i} ${EXT_DIR}
done

cp -r images ${EXT_DIR}


# compress zip file
zip -r ${ZIP_FILE}  ${EXT_DIR}

# delete directory
rm -r ${EXT_DIR}

echo "$ZIP_FILE created"
