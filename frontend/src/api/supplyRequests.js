import api from "./api";

// richieste di fornitura: il dipendente le crea e annulla le sue in attesa,
// il responsabile le accoglie o le respinge (con il motivo)

// nuova richiesta per il negozio del dipendente (il negozio lo mette il server)
export const createSupplyRequest = async (requestData) => {
  const data = await api("/supply-requests", {
    method: "POST",
    body: requestData,
  });
  return data.supplyRequest;
};

// il responsabile accoglie la richiesta: la fornitura verrà mandata al negozio
export const acceptSupplyRequest = async (requestId) => {
  const data = await api(`/supply-requests/${requestId}`, {
    method: "PATCH",
    body: { state: "handled" },
  });
  return data.supplyRequest;
};

// il responsabile respinge la richiesta e spiega perché (il dipendente lo legge)
export const rejectSupplyRequest = async (requestId, reason) => {
  const data = await api(`/supply-requests/${requestId}`, {
    method: "PATCH",
    body: { state: "rejected", reason },
  });
  return data.supplyRequest;
};

// il dipendente annulla una sua richiesta ancora in attesa
export const deleteSupplyRequest = async (requestId) => {
  await api(`/supply-requests/${requestId}`, { method: "DELETE" });
};
