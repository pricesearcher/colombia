
# Standard Makefile variables

APP_NAME = colombia
ENV ?= dev
PWD = $(shell pwd)
REGION = eu-west-1
CACHE_NAME := $(shell node src/tools/getCacheName.js)
GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
DOCKER_IMAGE_NAME = pricesearcher/$(APP_NAME)_$(GIT_BRANCH)
DOCKER_TTY = -it
ifdef OS
    DOCKER_TTY = -i
endif
DOCKER_RUN_ARGS = \
		-v "$(PWD)/src":/app/src \
		-v "$(PWD)/build":/app/build \
		-v /var/run/docker.sock:/var/run/docker.sock \
		--env GIT_BRANCH=$(GIT_BRANCH) \
		--env ENV=$(ENV) \
		$(DOCKER_IMAGE_NAME)


# Make Target Group 1: clean

clean:
	@echo "⚒ clean"
	rm -fr build/*

jenkins_clean:
	@echo "⚒ jenkins_clean"
	docker run --rm $(DOCKER_RUN_ARGS) /bin/bash -c "make clean"


# Make Target Group 2: build

build: build/vars.json build_client build_server build_assets
	@echo "⚒ build"

build_docker:
	@echo "⚒ build_docker"
	docker build \
	  --file src/config/Dockerfile \
		--tag $(DOCKER_IMAGE_NAME) .

build/vars.json:
	@echo "⚒ build/vars.json"
	node src/tools/setVars.js $(ENV) $(GIT_BRANCH) $(CACHE_NAME)
	cat build/vars.json

build_assets:
	@echo "⚒ build_assets"
#	cp src/header/index.html build/index.html
	node src/tools/convertEJS.js src/header/index.ejs build/index.html

build_client:
	@echo "⚒ build_client"
#	npx webpack --mode=production --config src/config/webpack.client.js
	npx parcel build src/header/Header.tsx -d build/$(CACHE_NAME) --out-file app_header.min.js

jenkins_build: build_docker
	@echo "⚒ jenkins_build"
	docker run --rm $(DOCKER_RUN_ARGS) /bin/bash -c "make build && ls -laR /app/build"

build_server:
	@echo "⚒ build_server"
#	npx webpack --mode=production --config src/config/webpack.client.js
	npx parcel build src/server/local.ts -d build/server --target=node --out-file local.js


# Make Target Group 3: test

test:
	@echo "⚒ test"

jenkins_test:
	@echo "⚒ jenkins_test"
	docker run --rm $(DOCKER_RUN_ARGS) /bin/bash -c "make test"


# Make Target Group 4: deploy

deploy:
	@echo "⚒ deploy"

jenkins_deploy:
	@echo "⚒ jenkins_deploy"
	docker run --rm $(DOCKER_RUN_ARGS) /bin/bash -c "make deploy"


# Make Target Group 5: start/stop/watch

start_docker:
	@echo "⚒ start_docker"
	docker run $(DOCKER_TTY) --rm -p 8081:8081 $(DOCKER_RUN_ARGS) /bin/bash

start_server:
	@echo "⚒ start_server"

stop_server:
	@echo "⚒ stop_server"

watch:
	@echo "⚒ watch"
