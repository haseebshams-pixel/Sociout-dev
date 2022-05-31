const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 50,
  },
  lastname: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 50,
  },
  email: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
  },
  phonenumber: {
    type: String,
    required: true,
    maxLength: 11,
  },
  DOB: {
    type: Date,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
    Default: null,
  },
  bio: {
    type: String,
    required: false,
    Default: null,
  },
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_PRIVATE_KEY);
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    firstname: Joi.string().min(1).max(50).required(),
    lastname: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(255).required(),
    phonenumber: Joi.string().min(11).max(11),
    DOB: Joi.string().min(10).max(10),
    bio: Joi.string().min(0).max(255),
  });
  return schema.validate(user);
}
function validateUserCreds(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(255).required(),
  });
  return schema.validate(user);
}

function validateEditUser(user) {
  const schema = Joi.object({
    firstname: Joi.string().min(1).max(50).required(),
    lastname: Joi.string().min(1).max(50).required(),
    phonenumber: Joi.string().min(11).max(11),
    DOB: Joi.string().min(10).max(10),
    bio: Joi.string().min(0).max(255),
  });
  return schema.validate(user);
}

function validateUserPassword(user) {
  const schema = Joi.object({
    oldpassword: Joi.string().min(6).max(255).required(),
    newpassword: Joi.string().min(6).max(255).required(),
  });
  return schema.validate(user);
}

module.exports.User = User;
module.exports.userSchema = userSchema;
module.exports.validate = validateUser;
module.exports.validateCreds = validateUserCreds;
module.exports.validateEditUser = validateEditUser;
module.exports.validateUserPassword = validateUserPassword;
