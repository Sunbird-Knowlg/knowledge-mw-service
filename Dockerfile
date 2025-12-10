FROM node:22.17.1-bookworm
RUN useradd -m sunbird-dev
USER sunbird-dev
COPY --chown=sunbird-dev src /opt/content/
WORKDIR /opt/content/
RUN npm install

FROM node:22.17.1-bookworm

RUN useradd -m sunbird
COPY --from=0 --chown=sunbird /opt/content /home/sunbird/mw/content
WORKDIR /home/sunbird/mw/content/
CMD ["node", "app.js"]