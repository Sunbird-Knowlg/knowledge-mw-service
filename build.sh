docker build -f ./content/services/js-services/content_service/Dockerfile.Build -t sunbird/content_service:0.0.1-build . 
docker run --name content_service-0.0.1-build sunbird/content_service:0.0.1-build 
containerid=`docker ps -q -a -f name=content_service-0.0.1-build`
docker cp $containerid:/opt/content_service.zip ./content/services/js-services/content_service/content_service.zip
docker rm $containerid
docker build -f ./content/services/js-services/content_service/Dockerfile -t sunbird/content_service:0.0.1-bronze .