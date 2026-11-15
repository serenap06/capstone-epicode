// nome corto del giorno della settimana, per esempio "lun".
// toLocaleDateString con "it-IT" scrive la data in italiano, weekday "short" = solo il giorno abbreviato
export const formatDayName = (day) =>
  new Date(day).toLocaleDateString("it-IT", { weekday: "short" });
