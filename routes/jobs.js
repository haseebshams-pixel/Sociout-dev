var express = require("express");
var router = express.Router();

const _ = require("lodash");
const auth = require("../middleware/auth");

const { User } = require("../models/users");
const { Job, validate } = require("../models/jobs");

router.get("/:id", async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(400).send("Can't find Job!");
    res.send(job);
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
      _.pick(req.body, [
        "title",
        "companyName",
        "employmentType",
        "location",
        "email",
        "description",
        "postedBy",
        "date",
      ])
    );
    if (error) return res.status(400).send(error.details[0].message);
    let job = new Job({
      title: req.body.title,
      companyName: req.body.companyName,
      employmentType: req.body.employmentType,
      location: req.body.location,
      email: req.body.email,
      description: req.body.description,
      postedBy: req.body.postedBy,
      date: new Date(),
    });
    job = await job.save();
    res.send(job);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
});

router.get("/", async (req, res) => {
  try {
    let jobs = await Job.find({}).sort("-date");
    if (!jobs) return res.status(404).send("Can't find Jobs!");

    res.send(jobs);
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
    let jobs = await Job.find({}, undefined, { skip, limit: 4 }).sort("-date");
    if (!jobs) return res.status(404).send("Can't find Jobs!");

    res.send(jobs);
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
      _.pick(req.body, [
        "title",
        "companyName",
        "employmentType",
        "location",
        "email",
        "description",
        "postedBy",
        "date",
      ])
    );
    if (error) return res.status(400).send(error.details[0].message);
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(400).send("Job not found!");
    if (job.postedBy.toString() !== user.id)
      return res.status(400).send("You don't have permission to do that.");

    job = await Job.findByIdAndUpdate(
      job.id,
      {
        $set: {
          title: req.body.title,
          companyName: req.body.companyName,
          employmentType: req.body.employmentType,
          location: req.body.location,
          email: req.body.email,
          description: req.body.description,
          postedBy: req.body.postedBy,
          date: new Date(),
        },
      },
      { new: true }
    );
    res.send(job);
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
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(400).send("Job not found!");
    if (job.postedBy.toString() !== user.id)
      return res.status(400).send("You don't have permission to do that.");
    Job.findByIdAndRemove(job.id, function (err) {
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
