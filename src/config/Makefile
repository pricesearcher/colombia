
# Standard Makefile variables

ENV ?= dev
PWD = $(shell pwd)
APP_NAME = $(shell basename `pwd`)
REGION = eu-west-1
GIT_BRANCH ?= $(shell git rev-parse --abbrev-ref HEAD)
DOCKER_IMAGE_NAME = pricesearcher/$(APP_NAME)-$(GIT_BRANCH)
DOCKER_TTY = -it
ifdef OS
    DOCKER_TTY = -i
endif
DOCKER_RUN_ARGS = \
	-v "$(PWD)/src":/app/src \
	-v "$(PWD)/dist":/app/dist \
	-v /var/run/docker.sock:/var/run/docker.sock \
	--env ps_branch=$(GIT_BRANCH) \
	--env ps_env=$(ENV) \
	--env AWS_ACCESS_KEY_ID=$(AWS_ACCESS_KEY_ID) \
	--env AWS_DEFAULT_REGION=$(REGION) \
	--env AWS_SECRET_ACCESS_KEY=$(AWS_SECRET_ACCESS_KEY) \
	$(DOCKER_IMAGE_NAME)



# Make Target Group 1: clean

jenkins_clean:
	@echo "⚒ jenkins_clean"
	docker run --rm $(DOCKER_RUN_ARGS) /bin/bash -c "src/config/build.js clean"


build_docker:
	@echo "⚒ build_docker"
	docker build \
		--build-arg GITHUB_TOKEN=$(GITHUB_TOKEN) \
	  --file src/config/Dockerfile \
		--tag $(DOCKER_IMAGE_NAME) .


jenkins_build: build_docker
	@echo "⚒ jenkins_build"
	docker run --rm $(DOCKER_RUN_ARGS) /bin/bash -c "src/config/build.js build"


jenkins_test:
	@echo "⚒ jenkins_test"
	docker run --rm $(DOCKER_RUN_ARGS) /bin/bash -c "src/config/build.js test"


jenkins_deploy:
	@echo "⚒ jenkins_deploy"
	docker run --rm $(DOCKER_RUN_ARGS) /bin/bash -c "src/config/build.js deploy"


start_docker:
	@echo "⚒ start_docker"
	docker run $(DOCKER_TTY) --rm -p 8081:8081 $(DOCKER_RUN_ARGS) /bin/bash --login
