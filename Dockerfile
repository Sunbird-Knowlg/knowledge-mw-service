FROM mhart/alpine-node:6
MAINTAINER "Manojvv" "manojv@ilimi.in"
RUN apk update \
    && apk add unzip \
    && mkdir -p /opt/mw 
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