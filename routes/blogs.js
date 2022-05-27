var express = require("express");
var router = express.Router();

const _ = require("lodash");
const auth = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

const upload = require("../middleware/multer")("../public/uploads/images/");

const { User } = require("../models/users");
const { Blog, validate, validateEdit } = require("../models/blogs");

router.get("/user/:id", async (req, res) => {
  try {
    let postedByuser = await Blog.find({
      postedBy: req.params.id,
    }).sort("-date");
    res.send(postedByuser);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.post("/", [auth, upload.array("photos", 10)], async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Can't find User!");

    req.body.postedBy = req.user._id;

    const { error } = validate(
      _.pick(req.body, ["text", "images", "postedBy", "date"])
    );
    if (error) return res.status(400).send(error.details[0].message);

    let blog = new Blog({
      text: req.body.text,
      images: req.files.map((file) => file.filename),
      postedBy: req.body.postedBy,
      date: new Date(),
    });
    blog = await blog.save();
    res.send(blog);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/", async (req, res) => {
  try {
    let blogs = await Blog.find({}).sort("-date");
    if (!blogs) return res.status(404).send("Can't find blogs");

    res.send(blogs);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.put("/:id", [auth, upload.array("photos")], async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    let user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("Can't find User!");

    const { error } = validateEdit(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(400).send("Blog not found!");
    let updatedPhotos = JSON.parse(req.body.images);
    const removedPhotos = JSON.parse(req.body.removedImages);
    if (removedPhotos.length > 0) {
      for (let k = 0; k < removedPhotos.length; k++) {
        for (let i = 0; i < blog.images.length; i++) {
          if (blog.images[i] === removedPhotos[k]) {
            fs.unlinkSync(
              path.join(__dirname, `../public/uploads/images/${blog.images[i]}`)
            );
          }
        }
      }
    }
    if (req.files) {
      req.files.map((file) => {
        updatedPhotos.push(file.filename);
      });
    }

    blog = await Blog.findByIdAndUpdate(
      blog.id,
      {
        $set: {
          text: req.body.text,
          images: updatedPhotos,
          postedBy: req.body.postedBy,
          date: new Date(),
        },
      },
      { new: true }
    );

    res.send(blog);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    console.log(req.params.id);
    let blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(400).send("Blog not found!");

    if (blog.images) {
      blog.images.forEach((img) =>
        fs.unlinkSync(path.join(__dirname, `../public/uploads/images/${img}`))
      );
    }
    Blog.findByIdAndRemove(blog.id, function (err) {
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
