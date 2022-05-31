var express = require("express");
var router = express.Router();

const _ = require("lodash");

const { User } = require("../models/users");
const { Job } = require("../models/jobs");

router.post("/", async (req, res) => {
  try {
    function escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    const regex = new RegExp(escapeRegex(req.body.name), "gi");
    let users = await User.find(
      { firstname: regex },
      function (err, usersfound) {
        if (err) {
          console.log(err);
        } else {
          usersfound = usersfound.map((user) => user._id);
          res.status(200).send(usersfound);
        }
      }
    )
      .clone()
      .catch(function (err) {
        console.log(err);
      });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.post("/jobs", async (req, res) => {
  try {
    function escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    const regex = new RegExp(escapeRegex(req.body.name), "gi");
    let users = await Job.find({ title: regex }, function (err, jobsfound) {
      if (err) {
        console.log(err);
      } else {
        console.log(jobsfound);
        res.status(200).send(jobsfound);
      }
    })
      .clone()
      .catch(function (err) {
        console.log(err);
      });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});
module.exports = router;
