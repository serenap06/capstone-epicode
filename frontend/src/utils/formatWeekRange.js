// "15 novembre"
const formatDayMonth = (date) =>
  date.toLocaleDateString("it-IT", { day: "numeric", month: "long" });

// "dal 9 al 15 novembre" o "dal 30 novembre al 6 dicembre" (days: i 7 giorni)
export const formatWeekRange = (days) => {
  const firstDay = days[0];
  const lastDay = days[6];
  // stesso mese: lo scrivo una volta
  const isSameMonth = firstDay.getMonth() === lastDay.getMonth();
  const start = isSameMonth ? firstDay.getDate() : formatDayMonth(firstDay);
  return `dal ${start} al ${formatDayMonth(lastDay)}`;
};
