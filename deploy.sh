#!/bin/bash

echo What should the version be?
read VERSION

docker build -t ezlidor/todolistappapi:$VERSION .
docker push ezlidor/todolistappapi:$VERSION
ssh root@159.223.26.62 "docker pull ezlidor/todolistappapi:$VERSION && docker tag ezlidor/todolistappapi:$VERSION dokku/api:latest && dokku tags:deploy api latest"