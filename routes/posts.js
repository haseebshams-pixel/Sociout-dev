var express = require("express");
var router = express.Router();

const _ = require("lodash");
const auth = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

const upload = require("../middleware/multer")("../public/uploads/images/");

const { User } = require("../models/users");
const { Post, validate, validateEdit } = require("../models/post");
const { Like } = require("../models/like");

router.get("/user/:id", async (req, res) => {
  try {
    let postedByuser = await Post.find({
      postedBy: req.params.id,
    }).sort("-date");
    res.send(postedByuser);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(400).send("Can't find Post!");
    res.send(post);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Can't find User!");

    req.body.postedBy = req.user._id;

    const { error } = validate(
      _.pick(req.body, ["text", "images", "postedBy", "date"])
    );
    if (error) return res.status(400).send(error.details[0].message);
    let post = new Post({
      text: req.body.text,
      images: req.body.photos,
      postedBy: req.body.postedBy,
      date: new Date(),
    });
    let like = new Like({
      post: post.id,
      likedBy: [],
    });
    post.likeId = like.id;
    like.save();
    post = await post.save();
    res.send(post);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/", async (req, res) => {
  try {
    let posts = await Post.find({}).sort("-date");
    if (!posts) return res.status(404).send("Can't find Posts!");

    res.send(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/skiping/:skip", async (req, res) => {
  try {
    const skip =
      req.params.skip && /^\d+$/.test(req.params.skip)
        ? Number(req.params.skip)
        : 0;
    let posts = await Post.find({}, undefined, { skip, limit: 2 }).sort(
      "-date"
    );
    if (!posts) return res.status(404).send("Can't find Posts!");

    res.send(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Can't find User!");

    const { error } = validate(
      _.pick(req.body, ["text", "images", "postedBy", "date"])
    );
    if (error) return res.status(400).send(error.details[0].message);
    if (post.postedBy.toString() !== user.id)
      return res.status(400).send("You don't have permission to do that.");

    let post = await Post.findById(req.params.id);
    if (!post) return res.status(400).send("Post not found!");

    post = await Post.findByIdAndUpdate(
      post.id,
      {
        $set: {
          text: req.body.text,
          images: req.body.photos,
          postedBy: req.body.postedBy,
          date: new Date(),
        },
      },
      { new: true }
    );
    res.send(post);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Can't find User!");
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(400).send("Post not found!");
    if (post.postedBy.toString() !== user.id)
      return res.status(400).send("You don't have permission to do that.");

    Like.findByIdAndRemove(post.likeId, function (err) {
      if (err) {
        console.log(err);
      }
    });

    Post.findByIdAndRemove(post.id, function (err) {
      if (err) {
        console.log(err);
      }
    });

    res.status(200).send();
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = router;
