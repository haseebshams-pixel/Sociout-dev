const Joi = require("joi");
const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 0,
    max: 255,
    required: true,
  },
  companyName: {
    type: String,
    min: 0,
    max: 255,
    required: true,
  },
  employmentType: {
    type: String,
    min: 0,
    max: 255,
    required: true,
  },
  location: {
    type: String,
    min: 0,
    max: 255,
    required: true,
  },
  email: {
    type: String,
    min: 0,
    max: 255,
    required: true,
  },
  description: {
    type: String,
    min: 0,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    Default: Date.now,
  },
});

const Job = mongoose.model("Job", JobSchema);

function validateJob(obj) {
  const schema = Joi.object({
    title: Joi.string().min(0).max(255),
    companyName: Joi.string().min(0).max(255),
    employmentType: Joi.string().min(0).max(255),
    location: Joi.string().min(0).max(255),
    email: Joi.string().email().required(),
    description: Joi.string().min(0),
    postedBy: Joi.objectId().required(),
    date: Joi.date(),
  });
  return schema.validate(obj);
}

module.exports.Job = Job;
module.exports.JobSchema = JobSchema;
module.exports.validate = validateJob;
