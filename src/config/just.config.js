
const chalk = require("chalk");
const cp = require("child_process");
const fs = require("fs");
const { env } = require("yargs");
const { task, logger, series, parallel } = require("just-task");
const package_info = require("../../package.json");
const getVars = require("./getBuildVars");

const argv =
	env("PS_")
	.option("envName", {
		choices: [ "dev", "nonprod", "prod" ],
		demandOption: false,
		default: "dev",
		type: "string"
	})
	.option("gitBranch", {
		demandOption: false,
		type: "string"
	})
	.argv;


const getProperties = (function () {
	let props;
	return () => {
		if (!props) {
			// only attempt to evaluate git branch if not given as command-line arg or environment variable
			// `git rev-parse` will fail inside docker container, but here should always be available as an env var
			const git_branch = argv.gitBranch || execSync("git rev-parse --abbrev-ref HEAD");
			props = getVars(argv.envName, git_branch);
			props.app_name = `${package_info.name}`;
			props.region   = "eu-west-1";
			props.user_id  = execSync("id -u");
			props.group_id = execSync("id -g");
			props.pwd      = process.cwd();
			props.docker_image_name = `pricesearcher/${props.app_name}_${props.git_branch}`;
			props.docker_run_args = `\
-v "${props.pwd}/src":/app/src \
-v "${props.pwd}/build":/app/build \
-v /var/run/docker.sock:/var/run/docker.sock \
--user ${props.user_id}:${props.group_id} \
--env PS_GIT_BRANCH=${props.git_branch} \
--env PS_ENV_NAME=${props.env_name} \
${props.docker_image_name}`;
			props.docker_tty = "-it"; // TODO change to "-i" if Windows
			logger.info(props.build_msg);
		}
		return props;
	};
})();

const getPipelineDataString = (data) => {
	// let str = data.toString();
	// if (str.substr(str.length - 1) === "\n") {
	// 	str = str.substr(0, str.length - 1);
	// }
	// return str;
	return data.toString()
		.split("\n")
		.filter(line => (!!line)) // remove blank lines, incl final newline
		.map((line, index) => (index === 0) ? line : chalk.gray(line)) // gray-out subsequent lines
		.join("\n");
}

const exec = (os_cmd) => {
	logger.info(`running os command: ${os_cmd}`);
	return new Promise((resolve, reject) => {
		const proc = cp.exec(os_cmd);
		proc.stdout.on("data", (data) => {
			logger.info(getPipelineDataString(data));
		});
		proc.stderr.on("data", (data) => {
			logger.error(getPipelineDataString(data));
		});
		proc.on("exit", (code) => {
			// logger.info(`Child exited with code ${code}`);
			if (code === 0) {
				resolve();
			} else {
				reject(code);
			}
		});
	});
}

const execSync = (os_cmd) => {
	const out = String(cp.execSync(os_cmd)).trim();
	logger.info(`running os command: ${os_cmd} -> ${out}`);
	return out;
}

// Task Group 1: clean

task("clean", () => {
	exec("rm -fr build/*");
	exec("rm -fr build/.cache/*");
});

task("clean_ci", () => {
	const props = getProperties();
	exec(`docker run --rm ${props.docker_run_args} /bin/bash -c 'makep clean'`);
});


// Task Group 2: build

task("build_docker", () => {
	const props = getProperties();
	return exec(`docker build --file src/config/Dockerfile --tag ${props.docker_image_name} .`)
		.then(() => {
			fs.writeFileSync("build/start_docker.sh", `docker run ${props.docker_tty} --rm -p 8081:8081 ${props.docker_run_args} /bin/bash`, {
				mode: 0o776,
				encoding: "utf8",
			});
		});
});

task("build_assets", () => {
// cp src/header/index.html build/index.html
  exec(`node src/tools/convertEJS.js src/header/index.ejs build/index.html`);
});

task("build_client", () => {
	const props = getProperties();
// npx webpack --mode=production --config src/config/webpack.client.js
  exec(`npx parcel build src/header/Header.tsx -d build/${props.cache_name} --cache-dir build/.cache --out-file app_header.min.js`);
});

task("build_server", () => {
// npx webpack --mode=production --config src/config/webpack.client.js
  exec(`npx parcel build src/server/local.ts -d build/server --target=node --cache-dir build/.cache --out-file local.js`);
	fs.writeFileSync("build/start_server.sh", `node build/server/local.js`, {
		mode: 0o776,
		encoding: "utf8",
	});
	fs.writeFileSync("build/stop_server.sh", `fuser -k 8081/tcp`, {
		mode: 0o776,
		encoding: "utf8",
	});


});

task("build_in_docker", () => {
	const props = getProperties();
	exec(`docker run --rm ${props.docker_run_args} /bin/bash -c 'makep build && ls -laR /app/build'`);
});

task("build_ci", series("build_docker", "build_in_docker"));

task("build", series("build_client", "build_server", "build_assets"));


// Task Group 3: test

task("test", () => {
});

task("test_ci", () => {
	const props = getProperties();
	exec(`docker run --rm ${props.docker_run_args} /bin/bash -c 'makep test'`);
});


// Task Group 4: deploy

task("deploy", () => {
});

task("deploy_ci", () => {
	const props = getProperties();
	exec(`docker run --rm ${props.docker_run_args} /bin/bash -c 'makep deploy'`);
});


// Task Group 5: run

task("run_auth", () => {
	exec(`cd src && tsc && cd .. && node build/auth/local.js`);
});
