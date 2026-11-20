// import
import api from "./api";

// richieste della cassa (fondo cassa di apertura e chiusura)

// apro la cassa di oggi con il fondo cassa
export const openCashSession = async (openingFloat) => {
  const data = await api("/cash-sessions/open", {
    method: "POST",
    body: { openingFloat },
  });
  return data.cashSession;
};

// chiudo la cassa di oggi: { closingFloat, envelopeAmount }
export const closeCashSession = async (closingData) => {
  const data = await api("/cash-sessions/close", {
    method: "PATCH",
    body: closingData,
  });
  return data.cashSession;
};
