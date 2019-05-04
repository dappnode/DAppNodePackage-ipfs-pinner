FROM node:10.15.3-alpine as build

# Create app directory
WORKDIR /usr/src/app

RUN apk update && \
    apk add git python make g++ curl && \
    rm -rf /var/cache/apk/*

COPY . .

RUN yarn install --production
RUN yarn bundle

# This results in a single layer image
FROM alpine

WORKDIR /usr/src/app

RUN apk add --update nodejs

COPY --from=build /usr/src/app/bundle.js /usr/src/app

ENTRYPOINT node /usr/src/app/bundle.js
