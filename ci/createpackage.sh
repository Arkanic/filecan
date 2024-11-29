#!/bin/bash
mkdir -p ciout
rm -rf ciout/built/
mkdir ciout/built/

npm i
npm run build

cp -r build dist tools ci/include/* config.yml package.json package-lock.json README.md ciout/built/
cd ciout/built
zip -r ../filecan.zip .
cd ../..