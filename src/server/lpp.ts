
import Ejs from "ejs";
import Express from "express";
import Fs from "fs";

const app = Express();

export default app;

app.get("/lpp", (req: Express.Request, res: Express.Response) => {
  const data     = Fs.readFileSync("src/data/linked_product_advert.json", {
    encoding: "utf8",
  });
  const template_file = "src/lpp/LinkedProductPage.ejs";
  const template = Fs.readFileSync(template_file, {
    encoding: "utf8",
  });
  const output   = Ejs.render(template, JSON.parse(data), {
    filename: template_file,
  });

  res.writeHead(200, {
    "Content-Type": "text/html"
  });
  res.end(output);
});
