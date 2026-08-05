ARG DHI_IMAGE_DEV=dhi.io/node:22.17.1-debian12-dev
ARG DHI_IMAGE_RUNTIME=dhi.io/node:22.17.1-debian12

FROM dhi.io/busybox:1.38.0-alpine3.24 AS shell

# ---- prep stage
FROM ${DHI_IMAGE_DEV} AS build
USER node
WORKDIR /opt/content/
COPY --chown=node src /opt/content/
RUN npm install

# ---- runtime stage
FROM ${DHI_IMAGE_RUNTIME}

COPY --from=shell /bin/busybox /bin/busybox
COPY --from=build --chown=node /opt/content /home/node/mw/content
WORKDIR /home/node/mw/content/
CMD ["node", "app.js"]

# RUN useradd -m sunbird
# COPY --from=0 --chown=sunbird /opt/content /home/sunbird/mw/content
# WORKDIR /home/sunbird/mw/content/
# CMD ["node", "app.js"]