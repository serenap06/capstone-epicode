// Nome corto del giorno della settimana, per esempio "lun"
export const formatDayName = (day) =>
  new Date(day).toLocaleDateString("it-IT", { weekday: "short" });
