// import
import { useId, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { formatFullName } from "../../../utils/formatFullName";
import { getCashBadge } from "../../../utils/getCashBadge";
import { getCashProblems } from "../../../utils/getCashProblems";
import { getNextSort } from "../../../utils/getNextSort";
import { PAGE_SIZE } from "../../../utils/pageSize";
import { sortList } from "../../../utils/sortList";

import FilterChips from "../../common/filterBar/FilterChips";
import Message from "../../common/message/Message";
import Pagination from "../../common/pagination/Pagination";
import SectionHeader from "../../common/sectionHeader/SectionHeader";
import CashClosingCard from "../cashClosingCard/CashClosingCard";
import CashClosingTable from "../cashClosingTable/CashClosingTable";

// casse per pagina con le card: sono grandi, ne bastano 6 (la tabella ne mostra 10 come le altre liste)
const CARD_PAGE_SIZE = 6;

// filtro dello stato: tutte, solo quelle a posto, solo quelle da controllare
const STATUS_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "ok", label: "Ok" },
  { value: "problem", label: "Da controllare" },
];

// su cosa ordinare ogni colonna (i valori di chiusura delle casse aperte valgono 0)
const SORT_VALUES = {
  day: (closing) => new Date(closing.cashSession.day).getTime(),
  store: (closing) => closing.cashSession.store.name,
  status: (closing) => closing.badge.label,
  openingFloat: (closing) => closing.cashSession.openingFloat,
  cashSales: (closing) => closing.cashSession.cashSales,
  cardSales: (closing) => closing.cashSession.cardSales,
  expectedCash: (closing) => closing.cashSession.expectedCash ?? 0,
  envelopeAmount: (closing) => closing.cashSession.envelopeAmount ?? 0,
  closingFloat: (closing) => closing.cashSession.closingFloat ?? 0,
  closedBy: (closing) =>
    closing.cashSession.closedAt
      ? formatFullName(closing.cashSession.closedBy)
      : "",
};

// componente CashClosingList: le chiusure di cassa del periodo, quelle che non tornano in evidenza
// (fino a 1366px le card, 6 per pagina; sopra la tabella che ordina, come le vendite, 10 per pagina).
// props: cashSessions, showStore = il negozio, showCards = card o tabella, emptyMessage = senza casse
const CashClosingList = ({
  cashSessions,
  showStore,
  showCards,
  emptyMessage,
}) => {
  // id per collegare la sezione al titolo
  const titleId = useId();
  // ordine scelto: si parte dalla più recente
  const [sort, setSort] = useState({ field: "day", direction: "desc" });
  const [page, setPage] = useState(1);
  // stato scelto: "" tutte, "ok" o "problem"
  const [status, setStatus] = useState("");

  // casse nuove (altro periodo o negozio): torno alla pagina 1 (prevCashSessions = l'elenco di prima)
  const [prevCashSessions, setPrevCashSessions] = useState(cashSessions);
  if (cashSessions !== prevCashSessions) {
    setPrevCashSessions(cashSessions);
    setPage(1);
  }

  // ogni cassa con il suo badge e se è da controllare, nell'ordine scelto
  const closings = sortList(
    cashSessions.map((cashSession) => ({
      cashSession,
      badge: getCashBadge(cashSession),
      isProblem: getCashProblems(cashSession).length > 0,
    })),
    SORT_VALUES[sort.field],
    sort.direction,
  );
  // le casse dello stato scelto
  const shownClosings = closings.filter(
    (closing) => status === "" || closing.isProblem === (status === "problem"),
  );

  // le pagine e le casse della pagina (6 card o 10 righe)
  const pageSize = showCards ? CARD_PAGE_SIZE : PAGE_SIZE;
  const totalPages = Math.ceil(shownClosings.length / pageSize);
  // passando dalla tabella alle card (o al contrario) la pagina può non esserci più: resto sull'ultima
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pageClosings = shownClosings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // clic su un'intestazione: nuovo ordine e pagina 1
  const sortByColumn = (field) => {
    setSort((prevSort) => getNextSort(prevSort, field));
    setPage(1);
  };

  // nuovo stato: pagina 1
  const changeStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <section className="mb-4" aria-labelledby={titleId}>
      {/* titolo e, accanto, tutte, ok o da controllare (solo se ci sono casse) */}
      <SectionHeader
        title="Chiusure di cassa"
        id={titleId}
        className="section-header-filters"
        aside={
          closings.length > 0 && (
            <FilterChips
              label="Stato delle chiusure"
              options={STATUS_OPTIONS}
              value={status}
              onChange={changeStatus} // nuovo stato: pagina 1
            />
          )
        }
      />
      {closings.length === 0 && <Message>{emptyMessage}</Message>}
      {closings.length > 0 && shownClosings.length === 0 && (
        <Message>
          {status === "problem"
            ? "Nessuna cassa da controllare"
            : "Nessuna cassa a posto"}
        </Message>
      )}

      {shownClosings.length > 0 &&
        (showCards ? (
          // una card per cassa: una per riga su telefono, due da 768px
          <Row xs={1} md={2} className="g-3">
            {pageClosings.map((closing) => (
              <Col key={closing.cashSession._id}>
                <CashClosingCard
                  closing={closing} // la cassa, il badge e se è da controllare
                  showStore={showStore}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <CashClosingTable
            closings={pageClosings} // le casse della pagina, con il badge
            showStore={showStore}
            sort={sort}
            onSort={sortByColumn} // clic su un'intestazione
          />
        ))}

      {/* le pagine, solo se sono più di una */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        label="Pagine delle chiusure di cassa"
        onChange={setPage}
      />
    </section>
  );
};

export default CashClosingList;
