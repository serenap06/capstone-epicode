// copia sul documento solo i campi arrivati nella richiesta:
// quelli undefined (non mandati) lasciano il valore che c'era
const assignDefinedFields = (document, data) => {
  Object.entries(data).forEach(([field, value]) => {
    if (value !== undefined) {
      document[field] = value;
    }
  });
};

module.exports = assignDefinedFields;
