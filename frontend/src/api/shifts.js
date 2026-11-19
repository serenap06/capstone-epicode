// import
import api from "./api";

// richieste dei turni (solo il responsabile)

// nuovo turno
export const createShift = async (shiftData) => {
  const data = await api("/shifts", { method: "POST", body: shiftData });
  return data.shift;
};

// modifico il turno
export const updateShift = async (shiftId, shiftData) => {
  const data = await api(`/shifts/${shiftId}`, {
    method: "PATCH",
    body: shiftData,
  });
  return data.shift;
};

// elimino il turno
export const deleteShift = async (shiftId) => {
  await api(`/shifts/${shiftId}`, { method: "DELETE" });
};
