const _ = require("lodash");
const express = require("express");
const app = express();
var cors = require("cors");

app.use(cors({ exposedHeaders: "Authorization" }));

require("./startup/dotenv")();
require("./startup/routes")(app);
require("./startup/db")();

//listener
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.info(`listening on port ${port}`);
});
