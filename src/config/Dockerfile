
FROM node:10-stretch

RUN apt-get update && apt-get install -yq libgconf-2-4 zip psmisc nano git-all

# Add the "project make" alias as a script - uses src/config/Makefile
RUN echo '#!/bin/bash\nnpx just "$@"' > /usr/bin/makep && \
    chmod +x /usr/bin/makep

RUN mkdir /app

WORKDIR /app

ADD just.config.js just.config.js
ADD package.json package.json
ADD package-lock.json package-lock.json

ARG GITHUB_TOKEN

# Add rewrite rule to authenticate with Github or private repos
RUN git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"

RUN npm install
