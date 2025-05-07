FROM node:22.15-slim
MAINTAINER "Manojvv" "manojv@ilimi.in"
USER root
COPY src /opt/content/
WORKDIR /opt/content/
RUN npm install --unsafe-perm

FROM node:22.15-slim
MAINTAINER "Manojvv" "manojv@ilimi.in"

RUN useradd -m sunbird
COPY --from=0 --chown=sunbird /opt/content /home/sunbird/mw/content
WORKDIR /home/sunbird/mw/content/
CMD ["node", "app.js", "&"]
