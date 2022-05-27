const mongoose = require("mongoose");

module.exports = function () {
  mongoose
    .connect(process.env.db)
    .then(() => console.info("connected to mongoDB"));
};
