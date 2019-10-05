FROM node:10.15.3 as build-deps-adminui
WORKDIR /usr/src/app
# Copy first to cache dependencies
COPY ui/package.json ./
COPY ui/yarn.lock ./
RUN curl https://www.google.es
RUN npm install --production -dd
# copy the contents of the app
COPY ui .
# Get this DNP version and git hash. Results in /usr/src/app/.version.json
RUN REACT_APP_PINNER_API_URL=http://localhost:3030 yarn run build

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
# UI build layer
################

FROM node:10.15.3-alpine as ui_build
WORKDIR /usr/src/app

COPY ui/package.json .
COPY ui/yarn.lock .
RUN npm install --production
RUN ls node_modules
COPY ui .
RUN yarn build
# The resulting static files to server are at ./build
RUN ls -ltr
RUN ls -ltr build

################
# Final layer
################

# This results in a single layer image
FROM alpine

WORKDIR /usr/src/app

RUN apk add --update nodejs

COPY --from=build /usr/src/app/bundle.js /usr/src/app

ENTRYPOINT node /usr/src/app/bundle.js
