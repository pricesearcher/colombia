
const Fs = require("fs");
let out;

try {
  const data = Fs.readFileSync("build/vars.json", {
    encoding: "utf8",
  });
  out = JSON.parse(data).cache_name;
} catch (e) {
  out = (new Date()).toISOString().replace(/[\:\.]/g, "-");
}
console.log(out);
