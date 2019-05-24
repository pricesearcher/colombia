
import * as Express from "express";


const app = Express();

app.use(Express.static(process.cwd() + "/build/"));

app.get("/random", (req: Express.Request, res: Express.Response) => {
  res.writeHead(200, {
    "Content-Type": "text/plain"
  });
  res.end(String(Math.ceil(Math.random() * 1000)));
});
