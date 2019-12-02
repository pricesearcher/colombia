
const Chalk = require("chalk");
const Cp = require("child_process");
const Fs = require("fs");
const { logger } = require("just-task");
const { env } = require("yargs");
const PackageInfo = require("../../package.json");
const BuildVarSource = require("./BuildVarSource.json");


const target_filename = "build/vars.json";
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


module.exports.exec = function (os_cmd) {
	logger.info(`running os command: ${os_cmd}`);
	return new Promise((resolve, reject) => {
		const proc = Cp.exec(os_cmd);
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


module.exports.execSync = function (os_cmd) {
	const out = String(Cp.execSync(os_cmd)).trim();
	logger.info(`running os command: ${os_cmd} -> ${out}`);
	return out;
}


module.exports.getProperties = (function () {
	let props;
	return () => {
		if (!props) {
			// only attempt to evaluate git branch if not given as command-line arg or environment variable
			// `git rev-parse` will fail inside docker container, but here should always be available as an env var
			const git_branch = argv.gitBranch || module.exports.execSync("git rev-parse --abbrev-ref HEAD");
			props = module.exports.getVars(argv.envName, git_branch);
			props.app_name = `${PackageInfo.name}`;
			props.region   = "eu-west-1";
			props.user_id  = module.exports.execSync("id -u");
			props.group_id = module.exports.execSync("id -g");
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


module.exports.getVars = function (env_name, git_branch) {
  let data;
  try {
    data = JSON.parse(Fs.readFileSync(target_filename, {
      encoding: "utf8",
    }));
  } catch (e) {
    // console.error(e);
  } // silently ignore ENOENT

  if (data) {
    validateExistingVars(data, env_name, git_branch);
    data.build_msg = "using EXISTING vars from build/vars.json: " + JSON.stringify(data);
  } else {
    validateBranchName(git_branch);
    data = calcNewVars(env_name, git_branch);
    writeNewVars(data);
    data.build_msg = "using NEW vars: " + JSON.stringify(data);
  }
  return data;
}


const calcNewVars = (env_name, git_branch) => {
  let base_url = BuildVarSource.Protocol[env_name] + "://" + BuildVarSource.Domain[env_name];
  if (BuildVarSource.Port[env_name]) {
    base_url += ":" + BuildVarSource.Port[env_name];
  }
  base_url += "/";
  if ((env_name === "prod" || env_name === "nonprod") && (git_branch !== "master")) {
    base_url += "branch/" + git_branch + "/";
  }
  return {
    base_url,
    cache_name: (new Date()).toISOString().replace(/[\:\.]/g, "-"),
    env_name,
    git_branch,
  };
}


const getPipelineDataString = (data) => {
	// let str = data.toString();
	// if (str.substr(str.length - 1) === "\n") {
	// 	str = str.substr(0, str.length - 1);
	// }
	// return str;
	return data.toString()
		.split("\n")
		.filter(line => (!!line)) // remove blank lines, incl final newline
		.map((line, index) => (index === 0) ? line : Chalk.gray(line)) // gray-out subsequent lines
		.join("\n");
}


const validateBranchName = (git_branch) => {
  if (!git_branch) {
    throw new Error(`ERROR git_branch argument is blank`);
  }
  if (git_branch.length > 37) {
    // aws_iam_role.lambda_role.name = "${var.app_name}-${var.env}-${var.branch}-lambda-role"
    // and this MUST BE <= 64 chars; hence for brazil-nonprod, that leaves 37 left for the branch name
    throw new Error(`ERROR branch name MUST NOT be > 37 characters: ${git_branch}`);
  }
  if (git_branch.match(/[^a-z0-9-]/)) {
    throw new Error(`ERROR branch name MUST ONLY contain lowercase alphanumeric and dash characters: ${git_branch}`);
  }
}


const validateExistingVars = (data, env_name, git_branch) => {
  if (data.env_name !== env_name) {
    throw new Error(`build/vars.json exists, ERROR env_name is different: ${data.env_name}`);
  }
  if (data.git_branch !== git_branch) {
    throw new Error(`build/vars.json exists, WARNING branch is different: ${data.git_branch}`);
  }
}


const writeNewVars = (data) => {
  const out = JSON.stringify(data, null, 2) + "\n";
  Fs.writeFileSync(target_filename, out); // pretty-print with 2-space indent
}
