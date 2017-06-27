FROM ubuntu:16.04
MAINTAINER "Manojvv" "manojv@ilimi.in"
RUN apt-get update && apt-get install -y git \
  unzip \
  zip \
  build-essential \
  curl
RUN mkdir -p /opt/mw \
    && curl --silent --location https://deb.nodesource.com/setup_6.x | bash - \
    && apt-get install --yes nodejs
WORKDIR /opt/mw
COPY content_service.zip  /opt/mw/
RUN unzip /opt/mw/content_service.zip
ARG MONGO_IP
ENV sunbird_mongo_ip $MONGO_IP
ENV sunbird_mongo_port 27017
ENV sunbird_content_service_port 5000
EXPOSE 27017 
EXPOSE 5000
WORKDIR /opt/mw/content/services/js-services/content_service
CMD ["node", "app.js", "&"]