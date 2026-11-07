const dashboardService = require("./service");

const getKpis = async (req, res, next) => {
  try {
    const { store } = req.query;
    const kpis = await dashboardService.getKpis({ store });
    res.status(200).send({
      statusCode: 200,
      kpis,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = { getKpis };
