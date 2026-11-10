const reportService = require("./service");

const findRevenue = async (req, res, next) => {
  try {
    const { from, to, groupBy, store } = req.query;
    const report = await reportService.findRevenue({
      from,
      to,
      groupBy,
      store,
    });
    res.status(200).send({
      statusCode: 200,
      report,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = { findRevenue };
