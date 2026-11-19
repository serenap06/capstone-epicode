// giorno corto: "lun"
export const formatDayName = (day) =>
  new Date(day).toLocaleDateString("it-IT", { weekday: "short" });
