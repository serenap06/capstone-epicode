// import
const authService = require("./service");

// POST /api/auth/login: controllo email e password, rispondo con token e utente
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });
    res.header("authorization", token).status(200).send({
      statusCode: 200,
      message: "Logged in successfully",
      token,
      user,
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/auth/me: l'utente del token
const me = (req, res) => {
  res.status(200).send(req.user);
};

module.exports = {
  login,
  me,
};
