
npm run build:singlefile

node --experimental-sea-config sea-config.json
pushd dist
node -e "require('fs').copyFileSync(process.execPath, 'b2c-tools-windows.exe')"

npx postject b2c-tools-windows.exe NODE_SEA_BLOB sea-prep.blob `
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
popd