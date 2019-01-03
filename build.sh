#!/bin/sh
# Build script
# set -o errexit
commit_hash=$1
name=content-service
version=$2
node=$3
org=$4

docker build -f ./Dockerfile.Build -t ${org}/${name}:${version}-build . 
docker run --name=${name}-${version}-build ${org}/${name}:${version}-build 
containerid=`docker ps -aqf "name=${name}-${version}-build"`
docker cp $containerid:/opt/content_service.zip content_service.zip
docker rm $containerid
docker build -f ./Dockerfile --label commitHash=$(git rev-parse --short HEAD) -t ${org}/${name}:${version}_${commit_hash} .
echo {\"image_name\" : \"${name}\", \"image_tag\" : \"${version}_${commit_hash}\", \"node_name\" : \"$node\"} > metadata.json
