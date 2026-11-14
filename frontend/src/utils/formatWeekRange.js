const formatDayMonth = (date) =>
  date.toLocaleDateString("it-IT", { day: "numeric", month: "long" });

// "dal 9 al 15 novembre", oppure "dal 30 novembre al 6 dicembre"
export const formatWeekRange = (days) => {
  const firstDay = days[0];
  const lastDay = days[6];
  const isSameMonth = firstDay.getMonth() === lastDay.getMonth();
  const start = isSameMonth ? firstDay.getDate() : formatDayMonth(firstDay);
  return `dal ${start} al ${formatDayMonth(lastDay)}`;
};
