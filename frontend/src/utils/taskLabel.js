// dizionari per tradurre i valori delle task che arrivano dal database (in inglese).
// Si leggono con le quadre: CATEGORY[task.category] → "Operativa"

// categoria della task
export const CATEGORY = {
  operations: "Operativa",
  administrative: "Amministrativa",
};

// priorità della task, in minuscolo perché va dopo la parola "Priorità"
export const PRIORITY = { high: "alta", medium: "media", low: "bassa" };
