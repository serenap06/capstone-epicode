// nome corto del giorno in italiano, per esempio "lun"
export const formatDayName = (day) =>
  new Date(day).toLocaleDateString("it-IT", { weekday: "short" });
