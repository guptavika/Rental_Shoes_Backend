const db = require("../db");

exports.createUser = (data, cb) => {
  db.query(
    "INSERT INTO users (name,email,password) VALUES (?,?,?)",
    data,
    cb
  );
};

exports.findUserByEmail = (email, cb) => {
  db.query("SELECT * FROM users WHERE email=?", [email], cb);
};
