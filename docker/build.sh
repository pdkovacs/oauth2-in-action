#!/bin/bash

set -x

repo_root="$(dirname $0)/.."
cd "$repo_root"

npm run build
rm -rf ./docker/build ./docker/dist
mkdir ./docker/dist
cp -r ./build/* ./docker/dist/
cp ./package.json ./docker/dist/
cp ./package-lock.json ./docker/dist/

docker build -t nightmanager/fake-oidc-server docker/.

cd -

set +x
