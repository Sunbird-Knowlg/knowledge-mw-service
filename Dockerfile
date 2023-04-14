FROM circleci/node:8.11.2-stretch
MAINTAINER "Manojvv" "manojv@ilimi.in"
USER root
COPY src /opt/content/
WORKDIR /opt/content/
RUN npm install --unsafe-perm

FROM node:8.11-slim
MAINTAINER "Manojvv" "manojv@ilimi.in"
# RUN sed -i '/jessie-updates/d' /etc/apt/sources.list \
RUN echo "deb http://archive.debian.org/debian/ jessie main" > /etc/apt/sources.list && \
    apt-get update && \
    apt-get install ca-certificates && \
    update-ca-certificates && \
    apt-get update && \
    apt-get install -y && \ 
    apt-get clean && \
    useradd -m sunbird     
USER sunbird
COPY --from=0 --chown=sunbird /opt/content /home/sunbird/mw/content
WORKDIR /home/sunbird/mw/content/
CMD ["node", "app.js", "&"]
