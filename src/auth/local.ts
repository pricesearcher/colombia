
import Express from "express";

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


const app2 = Express(); // Authorization Server (as per Role in sect 1.1)
app2.get("/authorize", (req, res) => { // Authorization endpoint
  if (req.query.response_type !== "code") {
    res.writeHead(403, "invalid response_type");
  } else if (req.query.client_id !== "xyz") {
    res.writeHead(403, "invalid / unrecognized client_id");
  } else {
    res.redirect(302, "confirm.html?" + reformQuery(req.query));
  }
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
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "http://localhost:8084"
  });
  res.end(JSON.stringify({
    token: "foo",
    name: "Stephen",
  }));
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
