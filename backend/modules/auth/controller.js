const authService = require("./service");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });
    res.header("authorization", token).status(200).send({
      statusCode: 200,
      message: "Login successfully",
      token,
      user,
    });
  } catch (e) {
    next(e);
  }
};

const me = (req, res) => {
  res.status(200).send(req.user);
};

module.exports = {
  login,
  me,
};
