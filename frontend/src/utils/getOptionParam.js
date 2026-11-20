// valore di un filtro preso dall'indirizzo (es. ?state=open), solo se è una delle opzioni; altrimenti ""
export const getOptionParam = (searchParams, name, options) => {
  const value = searchParams.get(name);
  return options.some((option) => option.value === value) ? value : "";
};
