var express = require("express");
var router = express.Router();

const _ = require("lodash");
const auth = require("../middleware/auth");

const { User } = require("../models/users");
const { Post } = require("../models/post");
const { Like } = require("../models/like");
const { Notification } = require("../models/notifications");

router.post("/like", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Can't find User!");

    let post = await Post.findById(req.body.id);
    if (!post) return res.status(400).send("Post not found!");

    let like = await Like.findOne({ post: post._id });

    like = await Like.findByIdAndUpdate(like._id, {
      $addToSet: {
        likedBy: user.id,
      },
    });

    let secondUser = await User.findById(post.postedBy);

    if (secondUser.id !== user.id) {
      let notification = new Notification({
        text: "liked your post!",
        sender: user.firstname,
        receiver: secondUser.id,
        date: Date.now(),
      });

      notification.save();
    }

    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    let likesObj = await Like.findOne({
      post: req.params.id,
    });
    res.send(likesObj);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/check/:id", auth, async (req, res) => {
  try {
    let currentuser = await User.findById(req.user._id);
    if (!currentuser) return res.status(400).send("Can't find User!");

    let post = await Post.findById(req.params.id);
    if (!post) return res.status(400).send("Post not found!");

    let likeCheck = await Like.findOne({
      $and: [{ post: post._id }, { likedBy: { $in: currentuser.id } }],
    });
    if (likeCheck) {
      return res.status(200).send({ state: true });
    } else {
      return res.status(200).send({ state: false });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/unlike/:id", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Can't find User!");

    let post = await Post.findById(req.params.id);
    if (!post) return res.status(400).send("Post not found!");

    let like = await Like.findOne({ post: post._id });

    like = await Like.findByIdAndUpdate(like._id, {
      $pull: {
        likedBy: req.user._id,
      },
    });
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = router;
