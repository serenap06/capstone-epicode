// copia ordinata della lista (lo stato non si tocca): testi con localeCompare, numeri con la sottrazione.
// getValue = su cosa ordinare; "desc" inverte
export const sortList = (list, getValue, direction) => {
  const sign = direction === "desc" ? -1 : 1;
  return [...list].sort((first, second) => {
    const firstValue = getValue(first);
    const secondValue = getValue(second);
    const result =
      typeof firstValue === "string"
        ? firstValue.localeCompare(secondValue)
        : firstValue - secondValue;
    return result * sign;
  });
};
