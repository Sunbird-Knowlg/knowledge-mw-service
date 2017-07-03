docker build -f Dockerfile.Build  .
docker run -it {{Imageid}}
docker cp {{Containerid}}:/opt/content-service.zip  .
docker build -f Dockerfile
