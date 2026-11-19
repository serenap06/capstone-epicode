// filtro delle task dai parametri della query (quelli vuoti li salto)
const buildTaskFilter = ({ status, category, type, isGlobal, from, to }) => {
  const taskFilter = {};
  if (status) taskFilter.status = status;
  if (category) taskFilter.category = category;
  if (type) taskFilter.type = type;
  if (isGlobal !== undefined) taskFilter.isGlobal = isGlobal;
  // scadenza tra from e to
  if (from || to) {
    taskFilter.dueDate = {};
    if (from) taskFilter.dueDate.$gte = new Date(from);
    if (to) taskFilter.dueDate.$lte = new Date(to);
  }
  return taskFilter;
};

module.exports = buildTaskFilter;
