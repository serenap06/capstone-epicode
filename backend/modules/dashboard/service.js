const Task = require("../tasks/schema");
const SupplyRequest = require("../supply-requests/schema");
const Stock = require("../stock/schema");
const Shift = require("../shifts/schema");

const getKpis = async (filters) => {
  const { store } = filters;
  const storeFilter = store ? { store } : {};

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const tasksTotal = await Task.countDocuments({
    dueDate: { $gte: startOfDay, $lte: endOfDay },
    ...storeFilter,
  });
  const tasksDone = await Task.countDocuments({
    dueDate: { $gte: startOfDay, $lte: endOfDay },
    status: "done",
    ...storeFilter,
  });
  const pendingRequests = await SupplyRequest.countDocuments({
    state: "open",
    ...storeFilter,
  });

  const lowStockItems = await Stock.countDocuments({
    $expr: { $lte: ["$amount", "$minThreshold"] },
    ...storeFilter,
  });

  const employeesOnShift = await Shift.distinct("user", {
    startAt: { $gte: startOfDay, $lte: endOfDay },
    ...storeFilter,
  });

  return {
    tasksToday: { total: tasksTotal, done: tasksDone },
    pendingSupplyRequests: pendingRequests,
    lowStockItems,
    employeesOnShiftToday: employeesOnShift.length,
  };
};

module.exports = { getKpis };
