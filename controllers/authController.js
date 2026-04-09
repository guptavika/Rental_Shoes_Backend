const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  User.createUser([name, email, hash], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Registered successfully" });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByEmail(email, async (err, result) => {
    if (result.length === 0)
      return res.status(404).json("User not found");

    const valid = await bcrypt.compare(password, result[0].password);
    if (!valid) return res.status(401).json("Wrong password");

    const token = jwt.sign({
      id: result[0].id,
      role: result[0].role
    }, "secret123");

    
    res.json({
      token,
      role: result[0].role,
      name: result[0].name
    });
  });
};
