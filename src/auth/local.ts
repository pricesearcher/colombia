
import Express from "express";

const local_path = process.cwd() + "/src/auth/";
const app1 = Express();
app1.get("/app.html", (req, res) => {
  res.sendFile(local_path + "app.html");
});
app1.get("/app.js", (req, res) => {
  res.sendFile(local_path + "app.js");
});
app1.get("/authorize", (req, res) => {
  res.redirect(302, "http://localhost:8082/authorize?" + reformQuery(req.query));
});
app1.get("/favicon.ico", (req, res) => {
  res.sendFile(local_path + "favicon.ico");
});
app1.listen(8081);
console.log(`Server is listening on port 8081 for http`);


const app2 = Express();
app2.get("/authorize", (req, res) => {
  res.redirect(302, "confirm.html?" + reformQuery(req.query));
});
app2.get("/confirm.html", (req, res) => {
  res.sendFile(local_path + "confirm.html");
});
app2.get("/favicon.ico", (req, res) => {
  res.sendFile(local_path + "favicon.ico");
});
app2.get("/no", (req, res) => {
  res.redirect(302, "http://localhost:8081/app.html");
});
app2.get("/token", (req, res) => {
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "http://localhost:8081"
  });
  res.end(JSON.stringify({
    token: "foo",
    name: "Stephen",
  }));
});
app2.get("/yes", (req, res) => {
  res.redirect(302, "http://localhost:8081/app.html?code=blah");
});

app2.listen(8082);
console.log(`Server is listening on port 8082 for http`);


function reformQuery(query) {
  return Object.keys(query)
    .map((param) => encodeURIComponent(param) + (query[param] ? "=" + encodeURIComponent(query[param]) : ""))
    .join("&");
}
