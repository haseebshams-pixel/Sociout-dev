const morgan = require("morgan");
const express = require("express");

const user = require("../routes/users");
const blogs = require("../routes/blogs");

module.exports = function (app) {
  app.use(express.json());
  app.use(morgan("tiny"));
  app.use("/api/users", user);
  app.use("/api/blogs", blogs);
};
