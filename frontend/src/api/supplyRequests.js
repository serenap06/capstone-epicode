// import
import api from "./api";

// richieste di fornitura: il dipendente crea e annulla, il responsabile accoglie o respinge

// nuova richiesta (il negozio lo mette il server)
export const createSupplyRequest = async (requestData) => {
  const data = await api("/supply-requests", {
    method: "POST",
    body: requestData,
  });
  return data.supplyRequest;
};

// accolgo la richiesta
export const acceptSupplyRequest = async (requestId) => {
  const data = await api(`/supply-requests/${requestId}`, {
    method: "PATCH",
    body: { state: "handled" },
  });
  return data.supplyRequest;
};

// respingo la richiesta con il motivo
export const rejectSupplyRequest = async (requestId, reason) => {
  const data = await api(`/supply-requests/${requestId}`, {
    method: "PATCH",
    body: { state: "rejected", reason },
  });
  return data.supplyRequest;
};

// annullo una mia richiesta in attesa
export const deleteSupplyRequest = async (requestId) => {
  await api(`/supply-requests/${requestId}`, { method: "DELETE" });
};
