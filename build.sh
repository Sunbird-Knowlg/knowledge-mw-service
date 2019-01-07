#!/bin/sh
# Build script
# set -o errexit
build_tag=$1
name=content-service
node=$2
org=$3

docker build -f ./Dockerfile.Build -t ${org}/${name}:${build_tag}-build . 
docker run --name=${name}-${build_tag}-build ${org}/${name}:${build_tag}-build 
containerid=$(docker ps -aqf "name=${name}-${build_tag}-build")
docker cp $containerid:/opt/content_service.zip content_service.zip
docker rm $containerid
docker build -f ./Dockerfile --label commitHash=$(git rev-parse --short HEAD) -t ${org}/${name}:${build_tag} .
echo {\"image_name\" : \"${name}\", \"image_tag\" : \"${build_tag}\", \"node_name\" : \"$node\"} > metadata.json
