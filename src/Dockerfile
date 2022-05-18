################
# UI build
################

FROM node:10.15.3-alpine as ui_build
WORKDIR /usr/src/app
# Copy and install deps first to cache
COPY ui/package.json ui/yarn.lock ./
RUN yarn
COPY ui .
RUN yarn build
# Results in build/*

################
# Server build
################

FROM node:10.15.3-alpine as server_build
WORKDIR /usr/src/app
COPY server/package.json server/yarn.lock ./
RUN yarn
COPY server/patches ./patches
RUN yarn postinstall
COPY server .
RUN yarn build
# Results in build/index.js

################
# Final layer
################

FROM alpine
WORKDIR /usr/src/app
# Lightest way to have node in alpine
RUN apk add --update nodejs

ENV SERVER_PORT 80
ENV CLIENT_FILES_PATH dist
ENV DATA_PATH /usr/src/app/data

# Copy index.js and source-maps
COPY --from=ui_build /usr/src/app/build /usr/src/app/${CLIENT_FILES_PATH}
COPY --from=server_build /usr/src/app/build /usr/src/app

CMD [ "node", "/usr/src/app" ]
