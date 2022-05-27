const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    res.status(201).send("Access denied, no token provided");
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
      req.user = decoded;
      next();
    } catch (ex) {
      res.status(201).send("Invalid token.");
    }
  }
}

module.exports = auth;
