#!/bin/bash
# This script create the archive for Chrome Store upload

# create the directory
EXT_DIR="ext_archive"
ZIP_FILE="extension.zip"
mkdir ${EXT_DIR}
echo "$EXT_DIR created"

# copy the files
ext_files=(
    "manifest.json"
    "popup.html");

for i in ${ext_files[@]}; do
     echo $i
     cp ${i} ${EXT_DIR}
done

cp -r js ${EXT_DIR}
cp -r images ${EXT_DIR}
cp -r css ${EXT_DIR}


# compress zip file
zip -r -FS ${ZIP_FILE}  ${EXT_DIR}

# delete directory
rm -r ${EXT_DIR}

echo "$ZIP_FILE created"
