const User = require("../users/schema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const InvalidCredentialException = require("../../exceptions/auth/InvalidCredentialException");

const login = async (body) => {
  const { email, password } = body;
  const user = await User.findOne({
    email: email,
  }).select("+password");
  if (!user) {
    throw new InvalidCredentialException();
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new InvalidCredentialException();
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const { password: _password, ...safeUser } = user.toObject();
  return { token, user: safeUser };
};

module.exports = {
  login,
};
