const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    likedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
    },
});

const Like = mongoose.model("Like", LikeSchema);

module.exports.Like = Like;
module.exports.LikeSchema = LikeSchema;