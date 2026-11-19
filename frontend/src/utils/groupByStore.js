// divido le righe delle ore per negozio: [{ store, rows }]
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
