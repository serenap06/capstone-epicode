const jwt = require("jsonwebtoken");
const User = require("../../modules/users/schema");
const InvalidTokenException = require("../../exceptions/auth/InvalidTokenException");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new InvalidTokenException();
    }
    let payload;
    try {
      payload = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    } catch {
      throw new InvalidTokenException();
    }
    const user = await User.findById(payload.id);
    if (!user) {
      throw new InvalidTokenException();
    }
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = authenticate;
