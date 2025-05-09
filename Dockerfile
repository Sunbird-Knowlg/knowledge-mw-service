FROM node:22.15-slim
RUN apt-get update && apt-get install -y git
COPY .git /opt/content/.git
COPY src /opt/content/
WORKDIR /opt/content/
RUN git config --global --add safe.directory /opt/content
RUN git submodule update --init --recursive
RUN npm install --unsafe-perm --production

FROM node:22.15-slim

RUN useradd -m sunbird
COPY --from=0 --chown=sunbird /opt/content /home/sunbird/mw/content
WORKDIR /home/sunbird/mw/content/
CMD ["node", "app.js", "&"]
