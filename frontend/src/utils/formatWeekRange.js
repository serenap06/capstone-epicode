// giorno e mese, per esempio "15 novembre". Solo per uso interno
const formatDayMonth = (date) =>
  date.toLocaleDateString("it-IT", { day: "numeric", month: "long" });

// primo e ultimo giorno di una settimana scritti in parole:
// "dal 9 al 15 novembre", oppure "dal 30 novembre al 6 dicembre".
// days: i 7 giorni della settimana (quelli di getWeekDays)
export const formatWeekRange = (days) => {
  const firstDay = days[0];
  const lastDay = days[6];
  // se la settimana è tutta nello stesso mese, il mese lo scrivo una volta sola
  const isSameMonth = firstDay.getMonth() === lastDay.getMonth();
  const start = isSameMonth ? firstDay.getDate() : formatDayMonth(firstDay);
  return `dal ${start} al ${formatDayMonth(lastDay)}`;
};
