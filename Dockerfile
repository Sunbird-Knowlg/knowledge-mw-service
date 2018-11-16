FROM node:6-alpine
MAINTAINER "Manojvv" "manojv@ilimi.in"
RUN apk update \
    && apk add unzip \
    && apk add curl \
    && adduser -u 1001 -h /home/sunbird/ -D sunbird \
    && apk add --update ca-certificates  \
    && apk add --update ca-certificates openssl
RUN apk add imagemagick
USER sunbird
ENV  GRAPH_HOME "/home/sunbird/ImageMagick-6.9.3"
ENV  PATH "$GRAPH_HOME/bin:$PATH"
RUN  wget -P /home/sunbird  https://www.imagemagick.org/download/binaries/ImageMagick-i386-pc-solaris2.11.tar.gz
RUN tar -xvzf /home/sunbird/ImageMagick-i386-pc-solaris2.11.tar.gz -C /home/sunbird
ENV  MAGICK_HOME "/home/sunbird/ImageMagick-6.9.3"
ENV  PATH "$MAGICK_HOME/bin:$PATH"
RUN mkdir -p /home/sunbird/mw
WORKDIR /home/sunbird/mw
COPY ./content_service.zip  /home/sunbird/mw/
RUN unzip /home/sunbird/mw/content_service.zip
WORKDIR /home/sunbird/mw/content/
CMD ["node", "app.js", "&"]
