var express = require("express");
var router = express.Router();

const _ = require("lodash");
const auth = require("../middleware/auth");

const { User } = require("../models/users");

router.post("/", async (req, res) => {
    try {
        function escapeRegex(text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        }
        const regex = new RegExp(escapeRegex(req.body.name), "gi");
        let users = await User.find(
            { firstname: regex },
            function (err, usersfound) {
                if (err) {
                    console.log(err);
                } else {
                    usersfound = usersfound.map((user) => user._id);
                    res.status(200).send(usersfound);
                }
            }
        )
            .clone()
            .catch(function (err) {
                console.log(err);
            });
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;