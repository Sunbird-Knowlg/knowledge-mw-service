FROM node:12.20.1
RUN apt-get update && apt-get install -y git
COPY . /opt/content/
WORKDIR /opt/content/
RUN git config --global --add safe.directory /opt/content
RUN git submodule init && \
    git submodule update
RUN cd src && npm install --unsafe-perm --production

FROM node:12.20.1

RUN useradd -m sunbird
COPY --from=0 --chown=sunbird /opt/content /home/sunbird/mw/content
WORKDIR /home/sunbird/mw/content/src
CMD ["node", "app.js", "&"]