// divide le righe delle ore per negozio, nell'ordine in cui arrivano:
// [{ store: { _id, name }, rows: [...] }, ...]. Con un negozio solo c'è un gruppo solo
export const groupByStore = (rows) => {
  const groups = [];
  rows.forEach((row) => {
    const group = groups.find((group) => group.store._id === row.store._id);
    if (group) {
      group.rows.push(row);
    } else {
      groups.push({ store: row.store, rows: [row] });
    }
  });
  return groups;
};
