
import Express from "express";
import Header from "./header";
import LPP from "./lpp";
import Random from "./random";

const app = Express();

app.use("/assets/", Express.static(process.cwd() + "/build/assets/"));
app.use(Header);
app.use(LPP);
app.use(Random);

app.listen(8081);
console.log(`Server is listening on port 8081 for http`);
