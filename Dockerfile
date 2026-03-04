FROM node:22.17.1-bookworm AS builder
RUN useradd -m sunbird-dev
USER sunbird-dev
COPY --chown=sunbird-dev src /opt/content/
WORKDIR /opt/content/
# Remove committed lib node_modules so npm overrides apply to transitive deps
RUN find libs/ -name node_modules -type d -prune -exec rm -rf {} +
RUN npm install --omit=dev

FROM node:22.17.1-bookworm-slim

RUN apt-get update && apt-get upgrade -y --no-install-recommends && rm -rf /var/lib/apt/lists/*
RUN useradd -m sunbird
COPY --from=builder --chown=sunbird /opt/content /home/sunbird/mw/content
WORKDIR /home/sunbird/mw/content/
CMD ["node", "app.js"]