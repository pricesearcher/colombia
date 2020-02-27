#!/usr/bin/env node

const BuildLib = require("paraguay/BuildLib");
const { cli, exec, glob, rule, task } = BuildLib.getBuildFunctions();
const args = BuildLib.getArgs();

// Uruguay.addToBuild(Uruguay.getProject(), rule, task);

const file_list = {};
file_list.src_typescript = glob("src/**/*.ts");
file_list.tgt_client_bundles = [
  `build/${args.cache_name}/app_header.min.js`,
];
file_list.tgt_server_bundles = [
  "build/server/local.js",
];
file_list.src_assets = [ "src/header/index.ejs" ];
file_list.tgt_assets = [ "build/index.html" ];
file_list.tgt_all_build = file_list.tgt_assets
  .concat(file_list.tgt_client_bundles)
  .concat(file_list.tgt_server_bundles);
  // .concat(task("uruguay"));

// Task Group 1: clean

task("clean", async () => {
	await exec("rm -fr build/*");
	await exec("rm -fr build/.cache/*");
});


// Task Group 2: build

rule(file_list.tgt_assets, file_list.src_assets, async () => {
  // cp src/header/index.html build/index.html
  await exec(`node src/tools/convertEJS.js src/header/index.ejs build/index.html`);
});

rule(file_list.tgt_client_bundles, file_list.src_typescript, async () => {
	const args = BuildLib.getArgs();
// npx webpack --mode=production --config src/config/webpack.client.js
	await exec(`npx parcel build src/header/Header.tsx -d build/${args.cache_name} --cache-dir build/.cache --out-file app_header.min.js`);
});

rule(file_list.tgt_server_bundles, file_list.src_typescript, async () => {
// npx webpack --mode=production --config src/config/webpack.client.js
	await exec(`npx parcel build src/server/local.ts -d build/server --target=node --cache-dir build/.cache --out-file local.js`);
});

task("build", file_list.tgt_all_build);


// Task Group 3: test

task("test", () => {
  let expected_path;
  if (args.env === "prod") {
    expected_path = "https://www.pricesearcher.com/";
  } else if (args.env === "nonprod") {
    expected_path = "https://npd.pricesearcher.com/";
    if (args.branch !== "master") {
      expected_path += "branch/" + args.branch + "/";
    }
  } else if (args.env === "dev") {
    expected_path = "http://localhost:8081/";
  } else {
    throw new Error(`unexpected env: ${args.env}`);
  }
  if (args.base_url !== expected_path) {
    throw new Error(`unexpected base_uri: ${args.base_url} <> ${expected_path}`);
  }
});


// Task Group 4: deploy

task("deploy", () => {
});


// Task Group 5: run

task("run_auth", async () => {
	await exec(`cd src && tsc && cd .. && node build/auth/local.js`);
});


cli(BuildLib.getPromakeArgs());
