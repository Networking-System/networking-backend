const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const keys = require("./keys.json");

app.set("keys", keys.networkingProject);

const routes = require("../routes/v1/routes");

//connect to database
const mongoose = require("./database/mongodb.js")(app.get("keys").db_name);

// Using CORS
app.use(cors());

//send post requests
app.use(express.json());

//Route middleware
app.use("", routes);

if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.PORT || 3001, () =>
    console.log("Server running on port 3001")
  );
}

module.exports = app;
