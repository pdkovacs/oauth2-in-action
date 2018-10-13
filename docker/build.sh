#!/bin/bash

set -x

repo_root="$(dirname $0)/.."
cd "$repo_root"

tsc
rm -rf ./docker/build ./docker/dist
mkdir ./docker/dist
cp -r ./build/* ./docker/dist/
cp ./package.json ./docker/dist/
cp ./package-lock.json ./docker/dist/

docker build -t oidc-mock docker/.

cd -

set +x
