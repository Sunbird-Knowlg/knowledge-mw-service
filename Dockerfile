FROM mhart/alpine-node:6
MAINTAINER "Manojvv" "manojv@ilimi.in"
RUN apk update \
    && apk add unzip
RUN adduser -u 1001 -h /home/sunbird/ -D sunbird
USER sunbird
RUN mkdir -p /home/sunbird/mw
WORKDIR /home/sunbird/mw
COPY content_service.zip  /home/sunbird/mw/
RUN unzip /home/sunbird/mw/content_service.zip
ARG MONGO_IP
ENV sunbird_mongo_ip $MONGO_IP
ENV sunbird_mongo_port 27017
ENV sunbird_content_service_port 5000
EXPOSE 27017 
EXPOSE 5000
WORKDIR /home/sunbird/mw/content/services/js-services/content_service
CMD ["node", "app.js", "&"]

