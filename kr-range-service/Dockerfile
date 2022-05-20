FROM node:14-slim
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG BUILD_ENV

RUN echo $BUILD_ENV
RUN mkdir -p /usr/src/service && chown -R node:node /usr/src/service
USER node

WORKDIR /usr/src/service
ENV https_proxy=${HTTPS_PROXY}
ENV http_proxy=${HTTP_PROXY}
ENV build_env=${BUILD_ENV}

COPY --chown=node:node ./package*.json ./yarn.lock ./
RUN if [ "$BUILD_ENV" = "ci" ] ; then echo "ci"; yarn install; else echo "prod" ;yarn --frozen-lockfile --production && yarn cache clean; fi
COPY --chown=node:node . .

EXPOSE 3000

CMD yarn db:migrate && yarn start
