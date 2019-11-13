
const Fs = require("fs");
const env_resource = {
  "Protocol": {
    "prod"   : "https",
    "nonprod": "https",
    "dev"    : "http",
  },
  "Domain": {
    "prod"   : "www.pricesearcher.com",
    "nonprod": "www-nonprod.ps-internal.net",
    "dev"    : "localhost",
  },
  "Port": {
    "dev"    : 8081,
  },
};
const target_filename = "build/vars.json";


module.exports = (env_name, git_branch) => {
  let data;
  try {
    data = JSON.parse(Fs.readFileSync(target_filename, {
      encoding: "utf8",
    }));
  } catch (e) {
    console.error(e);
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

const validateExistingVars = (data, env_name, git_branch) => {
  if (data.env_name !== env_name) {
    throw new Error(`build/vars.json exists, ERROR env_name is different: ${data.env_name}`);
  }
  if (data.git_branch !== git_branch) {
    throw new Error(`build/vars.json exists, WARNING branch is different: ${data.git_branch}`);
  }
};

const validateBranchName = (git_branch) => {
  if (git_branch.length > 37) {
    // aws_iam_role.lambda_role.name = "${var.app_name}-${var.env}-${var.branch}-lambda-role"
    // and this MUST BE <= 64 chars; hence for brazil-nonprod, that leaves 37 left for the branch name
    throw new Error(`ERROR branch name MUST NOT be > 37 characters: ${git_branch}`);
  }
  if (git_branch.match(/[^a-z0-9-]/)) {
    throw new Error(`ERROR branch name MUST ONLY contain lowercase alphanumeric and dash characters: ${git_branch}`);
  }
};


const calcNewVars = (env_name, git_branch) => {
  let base_url = env_resource.Protocol[env_name] + "://" + env_resource.Domain[env_name];
  if (env_resource.Port[env_name]) {
    base_url += ":" + env_resource.Port[env_name];
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
};

const writeNewVars = (data) => {
  const out = JSON.stringify(data, null, 2) + "\n";
  Fs.writeFileSync(target_filename, out); // pretty-print with 2-space indent
};
