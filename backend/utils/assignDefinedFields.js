// copio sul documento solo i campi arrivati (gli undefined lasciano il valore di prima)
const assignDefinedFields = (document, data) => {
  Object.entries(data).forEach(([field, value]) => {
    if (value !== undefined) {
      document[field] = value;
    }
  });
};

module.exports = assignDefinedFields;
