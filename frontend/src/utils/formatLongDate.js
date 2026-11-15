// data per esteso in italiano, per esempio "giovedì 12 novembre".
// Se non passo nessuna data usa quella di oggi
export const formatLongDate = (date = new Date()) =>
  new Date(date).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
