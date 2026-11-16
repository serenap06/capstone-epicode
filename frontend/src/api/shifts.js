import api from "./api";

// richieste sui turni (solo per il responsabile)

// crea il turno e restituisce quello salvato
export const createShift = async (shiftData) => {
  const data = await api("/shifts", { method: "POST", body: shiftData });
  return data.shift;
};

// modifica persona, giorno o orari del turno
export const updateShift = async (shiftId, shiftData) => {
  const data = await api(`/shifts/${shiftId}`, {
    method: "PATCH",
    body: shiftData,
  });
  return data.shift;
};

// elimina il turno (la pagina chiede prima conferma)
export const deleteShift = async (shiftId) => {
  await api(`/shifts/${shiftId}`, { method: "DELETE" });
};
