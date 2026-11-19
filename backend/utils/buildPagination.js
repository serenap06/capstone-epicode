// dati delle pagine per il frontend: pagina, righe per pagina e pagine totali
const buildPagination = (pageNumber, limitNumber, totalCount) => ({
  page: pageNumber,
  limit: limitNumber,
  totalPages: Math.ceil(totalCount / limitNumber),
});

module.exports = buildPagination;
