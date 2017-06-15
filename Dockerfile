# TODO: move to alpine
FROM ubuntu:16.04
MAINTAINER "Manojvv" "manojv@ilimi.in"
RUN apt-get update && apt-get install -y git \
  unzip \
  zip \
  build-essential \
  curl
RUN mkdir -p /opt/mw
WORKDIR /opt/mw
COPY content_service.zip  /opt/mw/
RUN unzip /opt/mw/content_service.zip
ENV sunbird_mongo_ip ${MONGO_IP}
ENV sunbird_mongo_port 27017
WORKDIR /opt/mw/content_service/services/js-services/content_service
CMD ["node", "app.js", "&"]
