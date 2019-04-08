FROM node:alpine
LABEL maintainer="NKMUN <webmaster@nkmun.cn>"

ENV DEFAULT_MONGO="mongodb://mongo/postie"
ENV TZ="Asia/Shanghai"
ENV NODE_ENV=production

USER root
WORKDIR /postie/

COPY package.json yarn.lock /postie/
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/${TZ} /etc/localtime && \
    echo ${TZ} > /etc/timezone && \
    apk del tzdata && \
    ( cd /postie/ ; yarn install )
COPY . /postie/

ENTRYPOINT ["/postie/bin/postie"]