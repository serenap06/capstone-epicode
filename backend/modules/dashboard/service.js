// import
const mongoose = require("mongoose");
const Task = require("../tasks/schema");
const SupplyRequest = require("../supply-requests/schema");
const Stock = require("../stock/schema");
const Shift = require("../shifts/schema");
const Sale = require("../sales/schema");
const round = require("../../utils/round");

// numeri delle card della Dashboard di oggi (con store solo di quel negozio)
const getKpis = async (filters) => {
  const { store } = filters;
  const storeFilter = store ? { store } : {};

  // inizio e fine di oggi
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // le cinque query partono insieme: aspetto solo la più lenta
  const [
    taskGroups,
    pendingRequests,
    lowStockItems,
    employeesOnShift,
    todaySales,
  ] = await Promise.all([
    // task di oggi contate una per gruppo; pendingCount = copie ancora da fare.
    // In aggregate l'id del negozio lo converto io in ObjectId
    Task.aggregate([
      {
        $match: {
          dueDate: { $gte: startOfDay, $lte: endOfDay },
          ...(store && { store: new mongoose.Types.ObjectId(store) }),
        },
      },
      {
        $group: {
          _id: "$groupId",
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "done"] }, 0, 1] },
          },
        },
      },
    ]),
    SupplyRequest.countDocuments({
      state: "open",
      ...storeFilter,
    }),
    Stock.countDocuments({
      $expr: { $lte: ["$amount", "$minThreshold"] },
      ...storeFilter,
    }),
    Shift.distinct("user", {
      startAt: { $gte: startOfDay, $lte: endOfDay },
      ...storeFilter,
    }),
    Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      // le annullate non contano
      cancelled: { $ne: true },
      ...storeFilter,
    })
      .select("total")
      .lean(),
  ]);

  const revenueToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  // gruppo fatto = nessuna copia da fare
  const tasksDone = taskGroups.filter(
    (group) => group.pendingCount === 0,
  ).length;

  return {
    tasksToday: { total: taskGroups.length, done: tasksDone },
    pendingSupplyRequests: pendingRequests,
    lowStockItems,
    employeesOnShiftToday: employeesOnShift.length,
    salesToday: {
      count: todaySales.length,
      revenue: round(revenueToday),
    },
  };
};

module.exports = { getKpis };
