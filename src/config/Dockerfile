
FROM node:8-stretch

RUN apt-get update && apt-get install -yq libgconf-2-4 make zip psmisc nano git-all

RUN mkdir /app

WORKDIR /app

ADD package.json package.json
ADD package-lock.json package-lock.json

ARG GITHUB_TOKEN

# Add rewrite rule to authenticate with Github or private repos
RUN git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"

RUN npm install
