const morgan = require("morgan");
const express = require("express");

const user = require("../routes/users");
const post = require("../routes/posts");
const like = require("../routes/likes");
const comment = require("../routes/comments");
const friend = require("../routes/friends");
const search = require("../routes/search");
const job = require("../routes/jobs");

module.exports = function (app) {
  app.use(express.json({ limit: "100mb" }));
  app.use(morgan("tiny"));
  app.use("/api/users", user);
  app.use("/api/posts", post);
  app.use("/api/likes", like);
  app.use("/api/comments", comment);
  app.use("/api/friends", friend);
  app.use("/api/search", search);
  app.use("/api/jobs", job);
};
