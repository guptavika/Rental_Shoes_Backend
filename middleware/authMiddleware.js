const jwt = require("jsonwebtoken");

exports.checkAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  const data = jwt.verify(token, "secret123");

  if (data.role !== "admin")
    return res.status(403).json("Access denied");

  next();
};
