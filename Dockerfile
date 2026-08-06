ARG DHI_IMAGE_DEV=dhi.io/node:22.17.1-debian12-dev
ARG DHI_IMAGE_RUNTIME=dhi.io/node:22.17.1-debian12

# ---- prep stage
FROM ${DHI_IMAGE_DEV} AS build
RUN useradd -m sunbird
USER sunbird
WORKDIR /opt/content/
COPY --chown=sunbird src /opt/content/
RUN npm install

# ---- runtime stage
FROM ${DHI_IMAGE_RUNTIME} AS runtime

FROM ${DHI_IMAGE_DEV} AS useradd-prep
COPY --from=runtime /etc/passwd /etc/passwd
COPY --from=runtime /etc/group /etc/group
RUN useradd -m -d /home/sunbird sunbird

FROM runtime

COPY --from=useradd-prep /etc/passwd /etc/passwd
COPY --from=useradd-prep /etc/group /etc/group
USER sunbird
COPY --from=build --chown=sunbird /opt/content /home/sunbird/mw/content
WORKDIR /home/sunbird/mw/content/
CMD ["node", "app.js"]