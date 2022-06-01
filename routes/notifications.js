var express = require("express");
var router = express.Router();

const _ = require("lodash");
const auth = require("../middleware/auth");

const { Notification } = require("../models/notifications");
const { User } = require("../models/users");

router.get("/", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Can't find User!");

    let notifications = await Notification.find({
      receiver: req.user._id,
    });

    res.send(notifications);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = router;
