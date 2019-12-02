
import Express from "express";
import * as Data from "../data/linked_product_1.json";

const app = Express();

export default app;

app.get("/random", (req: Express.Request, res: Express.Response) => {
  res.writeHead(200, {
    "Content-Type": "text/plain"
  });
  res.end(String(Math.ceil(Math.random() * 1000 * Data.body.approximate_result_count)));
});
