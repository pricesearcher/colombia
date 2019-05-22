
const Ejs = require("ejs");
const Fs = require("fs");
const Path = require("path");
const BuildVars = require("../../build/vars.json");

const convert = (template, target, mapping) => {
  const ejs_template = Ejs.compile(Fs.readFileSync(
    Path.resolve(process.cwd(), template), {
      encoding: "utf8",
    }));
    Fs.writeFileSync(target, ejs_template(mapping));
};

const src_file = process.argv[2];
const dst_file = process.argv[3];

if (!src_file || !dst_file) {
  throw new Error(`usage: node convertEJS.js {src file} {dest file}`);
}

convert(src_file, dst_file, BuildVars);
