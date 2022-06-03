var express = require("express");
var router = express.Router();

const _ = require("lodash");
const auth = require("../middleware/auth");

const { User } = require("../models/users");
const { Friend } = require("../models/friend");
const { Post } = require("../models/post");
const { Notification } = require("../models/notifications");

router.get("/check/:id", auth, async (req, res) => {
  try {
    let currentuser = await User.findById(req.user._id);
    if (!currentuser) return res.status(400).send("Can't find User!");

    let usertocheck = await User.findById(req.params.id);
    if (!usertocheck) return res.status(400).send("Can't find the second user");

    if (currentuser.id == usertocheck.id) {
      return res.status(200).send({ state: "yourself" });
    }

    let friendCheck = await Friend.findOne({
      $and: [{ user: currentuser._id }, { friends: { $in: usertocheck._id } }],
    });

    let friendpending = await Friend.findOne({
      $and: [{ user: currentuser._id }, { pending: { $in: usertocheck._id } }],
    });

    let friendrequested = await Friend.findOne({
      $and: [{ user: usertocheck._id }, { pending: { $in: currentuser._id } }],
    });

    if (friendCheck && !friendpending && !friendrequested) {
      return res.status(200).send({ state: "friend" });
    } else if (friendpending) {
      return res.status(200).send({ state: "pending" });
    } else if (friendrequested) {
      return res.status(200).send({ state: "requested" });
    } else {
      return res.status(200).send({ state: "notfriend" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/pending", auth, async (req, res) => {
  try {
    let currentuser = await User.findById(req.user._id);
    if (!currentuser) return res.status(400).send("Can't find User!");

    let friendObj = await Friend.findOne({ user: currentuser._id });
    res.status(200).send(friendObj.pending);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/confirm/:id/", auth, async (req, res) => {
  try {
    let currentuser = await User.findById(req.user._id);
    if (!currentuser) return res.status(400).send("Can't find User!");

    let friendObject = await Friend.findOne({ user: currentuser._id });
    if (!friendObject) return res.status(400).send("User not found!");

    let userToAdd = await User.findById(req.params.id);
    if (!userToAdd) return res.status(400).send("Can't find User!");

    if (!friendObject.pending.includes(userToAdd._id))
      return res.status(400).send("No request with the User found");

    await Friend.findOneAndUpdate(
      { user: currentuser._id },
      {
        $addToSet: {
          friends: userToAdd._id,
        },
        $pull: {
          pending: userToAdd._id,
        },
      }
    );

    await Friend.findOneAndUpdate(
      { user: userToAdd._id },
      {
        $addToSet: {
          friends: currentuser._id,
        },
      }
    );

    let notification = new Notification({
      text: "accepted your friend request!",
      sender: currentuser.firstname,
      receiver: userToAdd.id,
      date: Date.now(),
    });

    notification.save();

    res.status(200).send({ state: "friended" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/request/:id", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Can't find User!");

    let friend = await Friend.findOne({ user: user._id });
    if (!friend) return res.status(400).send("User not found!");

    let userToAdd = await User.findById(req.params.id);
    if (!userToAdd) return res.status(400).send("Can't find User!");

    //puting the person inside of the pending array
    await Friend.findOneAndUpdate(
      { user: userToAdd._id },
      {
        $addToSet: {
          pending: user._id,
        },
      }
    );

    let notification = new Notification({
      text: "sent you a friend request!",
      sender: user.firstname,
      receiver: userToAdd.id,
      date: Date.now(),
    });

    notification.save();

    res.status(200).send();
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/reject/:id", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Can't find User!");

    let friendObj = await Friend.findOne({ user: user._id });
    if (!friendObj) return res.status(400).send("User not found!");

    if (friendObj.pending.includes(req.params.id)) {
      friendObj = await Friend.findOneAndUpdate(
        { user: user._id },
        {
          $pull: {
            pending: req.params.id,
          },
        },
        { new: true }
      );
    }

    res.send(friendObj.pending);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/remove/:id", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Can't find User!");

    let friend = await Friend.findOne({ user: user._id });
    if (!friend) return res.status(400).send("User not found!");

    let userToRemove = await User.findById(req.params.id);
    if (!userToRemove) return res.status(400).send("Can't find User!");

    await Friend.findOneAndUpdate(
      { user: user._id },
      {
        $pull: {
          friends: userToRemove._id,
        },
      }
    );

    await Friend.findOneAndUpdate(
      { user: userToRemove._id },
      {
        $pull: {
          friends: user._id,
        },
      }
    );

    res.status(200).send();
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(400).send("Can't find User!");

    let friendsObject = await Friend.findOne({
      user: user._id,
    });
    if (!friendsObject) return res.status(400).send("User not found!");

    res.send(friendsObject.friends);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = router;
