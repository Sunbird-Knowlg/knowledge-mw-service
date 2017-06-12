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
COPY content-service.zip  /opt/mw/
RUN unzip /opt/mw/content-service.zip
WORKDIR /opt/mw/content-service/services/js-services/content_service \
    && npm install --unsafe-perm \
    && node app.js
