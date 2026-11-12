// Data per esteso, per esempio "giovedì 12 novembre"
export const formatLongDate = (date = new Date()) =>
  new Date(date).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
