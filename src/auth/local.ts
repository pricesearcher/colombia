
import Express from "express";
const crypto = require('crypto');

const local_path = process.cwd() + "/src/auth/";

// vocabulary in comments is as per https://tools.ietf.org/html/rfc6749

const app1 = Express(); // Client (as per Role in sect 1.1)
app1.get("/app.html", (req, res) => {
  res.sendFile(local_path + "app.html");
});
app1.get("/app.js", (req, res) => {
  res.sendFile(local_path + "app.js");
});
app1.get("/authorize", (req, res) => {
  res.redirect(302, "http://localhost:8085/authorize?" + reformQuery(req.query));
});
app1.get("/favicon.ico", (req, res) => {
  res.sendFile(local_path + "favicon.ico");
});
app1.listen(8084);
console.log(`Server is listening on port 8084 for http`);


let code_challenge; // stored in memory only - does not persist across re-starts
const app2 = Express(); // Authorization Server (as per Role in sect 1.1)
app2.get("/authorize", (req, res) => { // Authorization endpoint
  if (req.query.response_type !== "code") {
    res.writeHead(403, "invalid response_type");
  } else if (req.query.client_id !== "xyz") {
    res.writeHead(403, "invalid / unrecognized client_id");
  } else if (req.query.code_challenge_method !== "S256") {
    res.writeHead(403, "code_challenge_method MUST BE S256");
  } else if (!req.query.code_challenge) {
    res.writeHead(403, "code_challenge MUST BE supplied");
  } else {
    code_challenge = req.query.code_challenge;
    console.log(`remembering code_challenge: ${code_challenge}`);
    res.redirect(302, "confirm.html?" + reformQuery(req.query));
    return;
  }
  res.end();
});
app2.get("/confirm.html", (req, res) => {
  res.sendFile(local_path + "confirm.html");
});
app2.get("/favicon.ico", (req, res) => {
  res.sendFile(local_path + "favicon.ico");
});
app2.get("/no", (req, res) => {
  res.redirect(302, "http://localhost:8084/app.html");
});
app2.get("/token", (req, res) => { // Token endpoint
  if (!req.query.code_verifier) {
    res.writeHead(403, "code_verifier MUST BE supplied");
    res.end();
  } else {
    const converted_cv = encodeSHA256toBase64URLSafe(req.query.code_verifier);
    if (converted_cv !== code_challenge) {
      res.writeHead(403, "code_verifier DOES NOT MATCH stored code_challenge");
      res.end();
    } else {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "http://localhost:8084"
      });
      res.end(JSON.stringify({
        token: "foo",
        name: "Stephen",
      }));
    }
  }
});
app2.get("/yes", (req, res) => {
  res.redirect(302, "http://localhost:8084/app.html?code=blah&" + reformQuery(req.query));
});

app2.listen(8085);
console.log(`Server is listening on port 8085 for http`);


function reformQuery(query) {
  return Object.keys(query)
    .map((param) => encodeURIComponent(param) + (query[param] ? "=" + encodeURIComponent(query[param]) : ""))
    .join("&");
}



function encodeSHA256toBase64URLSafe(input_str) {
  const hash = crypto.createHash('sha256');
  hash.update(input_str);
  return hash.digest("base64")
    .split("=")[0]
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/*
function encodeURLSafeBase64(from_str) {
  return Buffer.from(from_str, "utf8").toString("base64")
    .split("=")[0]
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// console.log(encodeURLSafeBase64([ 3, 236, 255, 224, 193 ]));
// "A-z_4ME"

function decodeURLSafeBase64(base64_string) {
  return Buffer.from(base64_string
      .replace(/\-/g, "+")
      .replace(/_/g, "/"),
    "base64").toString("utf8");
}
*/
