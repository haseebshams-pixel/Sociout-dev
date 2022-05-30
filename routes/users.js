var express = require("express");
var router = express.Router();

const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const otpGenerator = require("otp-generator");

const { Friend } = require("../models/friend");
const { Otp } = require("../models/otp");
const {
    User,
    validate,
    validateCreds
} = require("../models/users");

router.post("/signup", async (req, res, next) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send("User Already Exists!");

        user = new User(
            _.pick(req.body, [
                "firstname",
                "lastname",
                "email",
                "password",
                "phonenumber",
                "DOB",
                "avatar",
                "bio",
            ])
        );
        let friend = new Friend({
            user: user.id,
            friends: [],
            pending: [],
        });
        friend.save();

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        const obj = { token: user.generateAuthToken(), user: user };
        res.send(obj);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.post("/signin", async (req, res, next) => {
    try {
        const { error } = validateCreds(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send("User Doesn't Exists");

        validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword)
            return res.status(400).send("Invalid email or password");

        const token = {
            token: user.generateAuthToken(),
            user: _.pick(user, [
                "id",
                "firstname",
                "lastname",
                "email",
                "DOB",
                "phonenumber",
                "avatar",
                "bio",
            ]),
        };
        res.send(token);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.post("/google_auth", async (req, res, next) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            user = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                DOB: Date.now(),
                phonenumber:"03xxxxxxxxx",
                password: req.body.googleId,
            });

            user.save();

            let friend = new Friend({
                user: user.id,
                friends: [],
                pending: [],
            });

            friend.save();
        }

        const token = {
            token: user.generateAuthToken(),
            user: _.pick(user, [
                "id",
                "firstname",
                "lastname",
                "email",
                "DOB",
                "phonenumber",
                "avatar",
                "bio",
            ]),
        };
        res.send(token);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.post("/facebook_auth", async (req, res, next) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            user = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                DOB: Date.now(),
                phonenumber:"03xxxxxxxxx",
                password: req.body.userID,
            });
            user.save();

            let friend = new Friend({
                user: user.id,
                friends: [],
                pending: [],
            });

            friend.save();
        }

        const token = {
            token: user.generateAuthToken(),
            user: _.pick(user, [
                "id",
                "firstname",
                "lastname",
                "email",
                "DOB",
                "phonenumber",
                "avatar",
                "bio",
            ]),
        };
        res.send(token);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/:id", async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).send("User Doesn't Exists");
        user = _.pick(user, [
            "id",
            "firstname",
            "lastname",
            "email",
            "DOB",
            "phonenumber",
        ]);
        res.send(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.post("/forgot_pass/:email", async (req, res) => {
    try {
        var email = req.params.email;
        let user = await User.findOne({ email });
        if (!user) return res.status(404).send("Email not registered!");

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
        });

        let otpEntry = new Otp({
            email: email.toString(), otpgenerated: otp.toString()
        });
        otpEntry.save();

        // Otp.insertMany([
        //     { email: email.toString(), otpgenerated: otp.toString() },
        // ]);

        let resetLink = "localhost:3000/verify-otp>Verify-OTP";
        const data = {
            from: "socioutofficial@outlook.com",
            to: email,
            subject: "Forget Password OTP",
            html: `<h1>Please Find Your Forget Password OTP</h1>
            <h1>${otp.toString()}</h1>
            <h2> Do not share this OTP with anyone</h2>
            <p> Click on this link to Continue
            <a href=${resetLink}</p>`,
        };

        var transporter = nodemailer.createTransport({
            service: 'outlook',
            port: 587,
            auth: {
                user: "socioutofficial@outlook.com",
                pass: "noobassbitch9999",
            },
        });

        transporter.sendMail(data, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        res.send("Check your Email!");
    } catch (err) {
        console.log("Something Went Wrong!: ", err);
    }
});

router.post("/verify-otp", async (req, res) => {
    const otpFound = await Otp.findOne({
        email: req.body.email,
        otpgenerated: req.body.otp,
    });

    if (!otpFound) {
        res.status(400).send("Invalid OTP!");
    } else {
        temp = await Otp.deleteMany({ email: req.body.email });
        res.send("Verification Successful! Now you can reset your password");
    }
});

router.put("/set-pass", async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(password, salt);

    let user = await User.findOne({ email: email });
    if (!user) return res.status(400).send("Invalid Email!");

    user = await User.findOneAndUpdate(
        { email: email },
        { password: newPassword }
    );

    return res.status(200).send("Password updated successfully!");
});


module.exports = router;