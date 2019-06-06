
import Express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import Header from "../header/Header";
import Header2 from "../header/Header2";
import * as Data from "../data/linked_product_advert.json";

const app = Express();

app.use(Express.static(process.cwd() + "/build/"));

app.get("/random", (req: Express.Request, res: Express.Response) => {
  res.writeHead(200, {
    "Content-Type": "text/plain"
  });
  res.end(String(Math.ceil(Math.random() * 1000 * Data.body.approximate_result_count)));
});

app.get("/ssr", (req: Express.Request, res: Express.Response) => {
  const props = {};
  const jsx: React.ComponentElement<any, any> = (Math.random() < 0.5)
    ? React.createElement(Header , props)
    : React.createElement(Header2, props);

  res.writeHead(200, {
    "Content-Type": "text/html"
  });
  res.end(renderToString(jsx));
});

app.listen(8081);
console.log(`Server is listening on port 8081 for http`);
