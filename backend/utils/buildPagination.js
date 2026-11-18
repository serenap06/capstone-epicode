// i dati della divisione in pagine che il server rimanda al frontend:
// la pagina, quante righe per pagina e quante pagine ci sono in tutto
const buildPagination = (pageNumber, limitNumber, totalCount) => ({
  page: pageNumber,
  limit: limitNumber,
  totalPages: Math.ceil(totalCount / limitNumber),
});

module.exports = buildPagination;
