// { from, store: "" } → "from=...", senza le voci vuote
export const toQuery = (params) => {
  // tengo solo le coppie [chiave, valore] con un valore
  const filledEntries = Object.entries(params).filter(
    ([, value]) => value !== "" && value !== undefined && value !== null,
  );
  return new URLSearchParams(filledEntries).toString();
};
