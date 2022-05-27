const express = require("express");

module.exports = function (app) {
  app.use("/public/uploads/images", express.static("public/uploads/images"));
};
