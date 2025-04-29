#!/usr/bin/env bash
# build a single file executable (linux)
set -e

npm run build:singlefile
node --experimental-sea-config sea-config.json
pushd dist
cp $(command -v node) b2c-tools-linux-x64

npx postject b2c-tools-linux-x64 NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

popd