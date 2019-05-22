
build: build_webpack

build_webpack:
	npx webpack --mode=production --config src/config/webpack.client.js

build_docker:
	@echo "⚒ build_docker"
	docker build \
	  --file src/config/Dockerfile \
		--tag pricesearcher/example_repo .

start_docker:
	@echo "⚒ start_docker"
	docker run -it --rm \
		-v "$(PWD)/src":/app/src \
		-v "$(PWD)/build":/app/build \
		-v /var/run/docker.sock:/var/run/docker.sock \
		pricesearcher/example_repo /bin/bash
