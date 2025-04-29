#!/usr/bin/env bash
# build a single file executable (macos)
set -e

npm run build:singlefile
node --experimental-sea-config sea-config.json
pushd dist
cp $(command -v node) b2c-tools-macos
codesign --remove-signature b2c-tools-macos

npx postject b2c-tools-macos NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA
codesign --sign - b2c-tools-macos
popd