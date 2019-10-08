# FROM tutum/dnsutils as aaa
# RUN cat /etc/resolv.conf
# RUN dig google.es

# RUN apk update && \
#   apk add git python make g++ curl && \
#   rm -rf /var/cache/apk/*

# COPY package.json .
# COPY yarn.lock .
# RUN yarn install --production

# RUN yarn add -D webpack webpack-cli
# COPY . .
# RUN yarn 

################
# Config
################

# ENV API_PORT 3030

################
# UI build
################

FROM node:10.15.3-alpine as ui_build
WORKDIR /usr/src/app
# Copy and install deps first to cache
COPY ui/package.json .
COPY ui/yarn.lock .
RUN yarn
# Build UI
COPY ui .
RUN yarn build
# Results in build/*

################
# Server build
################

FROM node:10.15.3-alpine as server_build
WORKDIR /usr/src/app
# Copy and install deps first to cache
COPY server/package.json .
COPY server/yarn.lock .
RUN yarn
# RUN apk update && \
#   apk add git python make g++ curl && \
#   rm -rf /var/cache/apk/*
COPY server .
RUN yarn build
# Results in build/bundle.js

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

# Copy builds
COPY --from=ui_build /usr/src/app/build /usr/src/app/${CLIENT_FILES_PATH}
COPY --from=server_build /usr/src/app/build/bundle.js /usr/src/app

ENTRYPOINT node /usr/src/app/bundle.js
