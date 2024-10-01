const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists!! Please login" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = new User({ username, email, password: hashedPassword });
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).json("User not found");

    const match = await bcrypt.compareSync(req.body.password, user.password);
    if (!match) return res.status(401).json("Incorrect Password");

    const token = jwt.sign(
      { _id: user._id, username: user.username, email: user.email },
      process.env.SECRET,
      {
        expiresIn: "3d",
      }
    );
    const { password, ...info } = user._doc;
    res.cookie("token", token).status(200).json(info);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.get("/logout", async (req, res) => {
  try {
    res.clearCookie("token", { sameSite: "none", secure: true }).status(200).send("User logged out successfully!");
  } catch (e) {
    res.status(500).json(e);
  }
});

router.get("/refetch", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }
  
  jwt.verify(token, process.env.SECRET, {}, async (err,data) => {
    if (err) {
      return res.status(404).json("Token is not valid");
    }
    res.status(200).json(data);
  });
});

module.exports = router;
