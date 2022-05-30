const Joi = require("joi");
const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    friends: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
    },
    pending: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
    },
});

const Friend = mongoose.model("Friend", FriendSchema);

module.exports.Friend = Friend;
module.exports.FriendSchema = FriendSchema;