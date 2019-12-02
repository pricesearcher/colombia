
const Fs = require("fs");
const env_resource = {
  "Protocol": {
    "prod"   : "https",
    "nonprod": "https",
    "dev"    : "http",
  },
  "Domain": {
    "prod"   : "www.pricesearcher.com",
    "nonprod": "npd.pricesearcher.com",
    "dev"    : "localhost",
  },
  "Port": {
    "dev"    : 8081,
  },
};

const target_filename = "build/vars.json";
const env_name   = process.argv[2];
const git_branch = process.argv[3];
const cache_name = process.argv[4];

let msg;
try {
  const data = JSON.parse(Fs.readFileSync(target_filename, {
    encoding: "utf8",
  }));
  if (data.env_name !== env_name) {
    msg = `build/vars.json exists, ERROR env_name is different: ${data.env_name}`;
  }
  if (data.git_branch !== git_branch) {
    msg = `build/vars.json exists, WARNING branch is different: ${data.git_branch}`;
  }
  if (msg) {
    console.error(msg);
    process.exit(1);
  }
  console.log("build/vars.json exists, no action");
  process.exit(0);
} catch (e) {} // silently ignore ENOENT

if (git_branch.length > 37) {
  // aws_iam_role.lambda_role.name = "${var.app_name}-${var.env}-${var.branch}-lambda-role"
  // and this MUST BE <= 64 chars; hence for brazil-nonprod, that leaves 37 left for the branch name
  msg = `ERROR branch name MUST NOT be > 37 characters: ${git_branch}`;
}
if (git_branch.match(/[^a-z0-9-]/)) {
  msg = `ERROR branch name MUST ONLY contain lowercase alphanumeric and dash characters: ${git_branch}`;
}
if (msg) {
  console.error(msg);
  process.exit(1);
}

let base_url = env_resource.Protocol[env_name] + "://" + env_resource.Domain[env_name];
if (env_resource.Port[env_name]) {
  base_url += ":" + env_resource.Port[env_name];
}
base_url += "/";
if ((env_name === "prod" || env_name === "nonprod") && (git_branch !== "master")) {
  base_url += "branch/" + git_branch + "/";
}

console.log(`env: ${env_name}, git_branch: ${git_branch}, base_url: ${base_url}`);


const out = JSON.stringify({
  base_url,
  cache_name,
  env_name,
  git_branch,
}, null, 2) + "\n";


Fs.writeFileSync(target_filename, out); // pretty-print with 2-space indent
