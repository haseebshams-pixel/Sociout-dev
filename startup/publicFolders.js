const express = require("express");

module.exports = function (app) {
  app.use("/public/uploads/images", express.static("public/uploads/images"));
  app.use(
    "/public/uploads/profile_pictures",
    express.static("public/uploads/profile_pictures")
);
};
