FROM node:6-alpine
MAINTAINER "Manojvv" "manojv@ilimi.in"
RUN apk update \
    && apk add unzip \
    && apk add curl \
    && adduser -u 1001 -h /home/sunbird/ -D sunbird
USER sunbird
RUN mkdir -p /home/sunbird/mw
WORKDIR /home/sunbird/mw
COPY ./content/services/js-services/content_service/content_service.zip  /home/sunbird/mw/
RUN unzip /home/sunbird/mw/content_service.zip
#ARG MONGO_IP
#ENV sunbird_mongo_ip $MONGO_IP
ENV sunbird_mongo_port 27017
ENV sunbird_content_service_port 5000
EXPOSE 27017 
EXPOSE 5000
RUN rm /home/sunbird/mw/content/services/js-services/content_service/content_service.zip
RUN rm /home/sunbird/mw/content_service.zip
WORKDIR /home/sunbird/mw/content/services/js-services/content_service
CMD ["node", "app.js", "&"]