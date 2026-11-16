// { from: "...", store: "" } → "from=..." per la richiesta, saltando le voci vuote
export const toQuery = (params) => {
  // Object.entries dà le coppie [chiave, valore]: tengo solo quelle con un valore
  const filledEntries = Object.entries(params).filter(
    ([, value]) => value !== "" && value !== undefined && value !== null,
  );
  return new URLSearchParams(filledEntries).toString();
};
