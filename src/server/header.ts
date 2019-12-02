
import Express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import Header from "../header/Header";
import Header2 from "../header/Header2";

const app = Express();

export default app;

app.get("/header", (req: Express.Request, res: Express.Response) => {
  const props = {};
  const jsx: React.ComponentElement<any, any> = (Math.random() < 0.5)
    ? React.createElement(Header , props)
    : React.createElement(Header2, props);

  res.writeHead(200, {
    "Content-Type": "text/html"
  });
  res.end(renderToString(jsx));
});
