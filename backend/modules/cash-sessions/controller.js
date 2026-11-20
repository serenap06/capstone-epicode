// import
const cashSessionService = require("./service");

// GET /api/cash-sessions/today: cassa di oggi, ultimo fondo di chiusura e incasso di oggi
const findToday = async (req, res, next) => {
  try {
    const { cashSession, lastClosingFloat, cashSales, cardSales } =
      await cashSessionService.findToday(req.user);
    res.status(200).send({
      statusCode: 200,
      cashSession,
      lastClosingFloat,
      cashSales,
      cardSales,
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/cash-sessions: le casse di un periodo, per la card "Cassa" delle Vendite
const findAll = async (req, res, next) => {
  try {
    const { from, to, store } = req.query;
    const cashSessions = await cashSessionService.findAll(
      { from, to, store },
      req.user,
    );
    res.status(200).send({ statusCode: 200, cashSessions });
  } catch (e) {
    next(e);
  }
};

// POST /api/cash-sessions/open: apro la cassa di oggi con il fondo cassa
const open = async (req, res, next) => {
  try {
    const { openingFloat } = req.body;
    const cashSession = await cashSessionService.open(
      { openingFloat },
      req.user,
    );
    res.status(201).send({
      statusCode: 201,
      message: "Cash register opened successfully",
      cashSession,
    });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/cash-sessions/close: chiudo la cassa di oggi con imbustato, fondo di chiusura e totale del POS
const close = async (req, res, next) => {
  try {
    const { closingFloat, envelopeAmount, posAmount } = req.body;
    const cashSession = await cashSessionService.close(
      { closingFloat, envelopeAmount, posAmount },
      req.user,
    );
    res.status(200).send({
      statusCode: 200,
      message: "Cash register closed successfully",
      cashSession,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = { findToday, findAll, open, close };
