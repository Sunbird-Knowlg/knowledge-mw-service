FROM node:12.20.1
MAINTAINER "Manojvv" "manojv@ilimi.in"
USER root
RUN git submodule update --init --recursive src/libs
COPY src /opt/content/
WORKDIR /opt/content/
RUN npm install --unsafe-perm

FROM node:12.20.1
MAINTAINER "Manojvv" "manojv@ilimi.in"

RUN useradd -m sunbird
COPY --from=0 --chown=sunbird /opt/content /home/sunbird/mw/content
WORKDIR /home/sunbird/mw/content/
CMD ["node", "app.js", "&"]
