const Task = require("../tasks/schema");
const SupplyRequest = require("../supply-requests/schema");
const Stock = require("../stock/schema");
const Shift = require("../shifts/schema");
const Sale = require("../sales/schema");

const getKpis = async (filters) => {
  const { store } = filters;
  const storeFilter = store ? { store } : {};

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // le sei query partono insieme con Promise.all: aspetto solo la più lenta,
  // non la somma di tutte (con await una dopo l'altra la Dashboard era lenta)
  const [
    tasksTotal,
    tasksDone,
    pendingRequests,
    lowStockItems,
    employeesOnShift,
    todaySales,
  ] = await Promise.all([
    Task.countDocuments({
      dueDate: { $gte: startOfDay, $lte: endOfDay },
      ...storeFilter,
    }),
    Task.countDocuments({
      dueDate: { $gte: startOfDay, $lte: endOfDay },
      status: "done",
      ...storeFilter,
    }),
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
      ...storeFilter,
    })
      .select("total")
      .lean(),
  ]);

  const revenueToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  return {
    tasksToday: { total: tasksTotal, done: tasksDone },
    pendingSupplyRequests: pendingRequests,
    lowStockItems,
    employeesOnShiftToday: employeesOnShift.length,
    salesToday: {
      count: todaySales.length,
      revenue: Math.round(revenueToday * 100) / 100,
    },
  };
};

module.exports = { getKpis };
