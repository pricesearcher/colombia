
const Fs = require("fs");
const { task, logger, series, parallel } = require("just-task");
const BuildLib = require("./BuildLib");


// Task Group 1: clean

task("clean", () => {
	BuildLib.exec("rm -fr build/*");
	BuildLib.exec("rm -fr build/.cache/*");
});

task("clean_ci", () => {
	const props = BuildLib.getProperties();
	BuildLib.exec(`docker run --rm ${props.docker_run_args} /bin/bash -c 'makep clean'`);
});


// Task Group 2: build

task("build_docker", () => {
	const props = BuildLib.getProperties();
	return BuildLib.exec(`docker build --file src/config/Dockerfile --tag ${props.docker_image_name} .`)
		.then(() => {
			Fs.writeFileSync("build/start_docker.sh", `docker run ${props.docker_tty} --rm -p 8081:8081 ${props.docker_run_args} /bin/bash`, {
				mode: 0o776,
				encoding: "utf8",
			});
		});
});

task("build_assets", () => {
// cp src/header/index.html build/index.html
BuildLib.exec(`node src/tools/convertEJS.js src/header/index.ejs build/index.html`);
});

task("build_client", () => {
	const props = BuildLib.getProperties();
// npx webpack --mode=production --config src/config/webpack.client.js
	BuildLib.exec(`npx parcel build src/header/Header.tsx -d build/${props.cache_name} --cache-dir build/.cache --out-file app_header.min.js`);
});

task("build_server", () => {
// npx webpack --mode=production --config src/config/webpack.client.js
	BuildLib.exec(`npx parcel build src/server/local.ts -d build/server --target=node --cache-dir build/.cache --out-file local.js`);
	Fs.writeFileSync("build/start_server.sh", `node build/server/local.js`, {
		mode: 0o776,
		encoding: "utf8",
	});
	Fs.writeFileSync("build/stop_server.sh", `fuser -k 8081/tcp`, {
		mode: 0o776,
		encoding: "utf8",
	});


});

task("build_in_docker", () => {
	const props = BuildLib.getProperties();
	BuildLib.exec(`docker run --rm ${props.docker_run_args} /bin/bash -c 'makep build && ls -laR /app/build'`);
});

task("build_ci", series("build_docker", "build_in_docker"));

task("build", series("build_client", "build_server", "build_assets"));


// Task Group 3: test

task("test", () => {
});

task("test_ci", () => {
	const props = BuildLib.getProperties();
	BuildLib.exec(`docker run --rm ${props.docker_run_args} /bin/bash -c 'makep test'`);
});


// Task Group 4: deploy

task("deploy", () => {
});

task("deploy_ci", () => {
	const props = BuildLib.getProperties();
	BuildLib.exec(`docker run --rm ${props.docker_run_args} /bin/bash -c 'makep deploy'`);
});


// Task Group 5: run

task("run_auth", () => {
	BuildLib.exec(`cd src && tsc && cd .. && node build/auth/local.js`);
});
