const User = require("../model/User");
const jwt = require("jsonwebtoken");
const isAuth = async (req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, login" });
    }
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ userId: decodedToken.userId });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized, use your account" });
    }
    user.password = null;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { isAuth };
