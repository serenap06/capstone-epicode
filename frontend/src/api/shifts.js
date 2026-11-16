import api from "./api";

// richieste sui turni (solo per il responsabile)

export const createShift = async (shiftData) => {
  const data = await api("/shifts", { method: "POST", body: shiftData });
  return data.shift;
};

export const updateShift = async (shiftId, shiftData) => {
  const data = await api(`/shifts/${shiftId}`, {
    method: "PATCH",
    body: shiftData,
  });
  return data.shift;
};

export const deleteShift = async (shiftId) => {
  await api(`/shifts/${shiftId}`, { method: "DELETE" });
};
