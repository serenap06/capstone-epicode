import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

import { useAuth } from "../../hooks/useAuth";
import { useIsPhone } from "../../hooks/useIsPhone";
import { loadData } from "../../api/loadData";
import { deleteStock } from "../../api/stocks";
import { isLowStock } from "../../utils/isLowStock";
import { toStoreOptions } from "../../utils/toStoreOptions";

import AddButton from "../../components/common/addButton/AddButton";
import ConfirmDialog from "../../components/common/confirmDialog/ConfirmDialog";
import Message from "../../components/common/message/Message";
import PageHeader from "../../components/common/pageHeader/PageHeader";
import FilterBar from "../../components/common/filterBar/FilterBar";
import FilterSearch from "../../components/common/filterBar/FilterSearch";
import FilterSelect from "../../components/common/filterBar/FilterSelect";
import FilterChips from "../../components/common/filterBar/FilterChips";

import StockCard from "../../components/stocks/stockCard/StockCard";
import StockTable from "../../components/stocks/stockTable/StockTable";
import FormModal from "../../components/common/formModal/FormModal";
import StockForm from "../../components/stocks/stockForm/StockForm";

// filtro dello stato: tutte le righe o solo quelle sotto la soglia
const LEVEL_OPTIONS = [
  { value: "", label: "Tutte" },
  { value: "low", label: "Sotto soglia" },
];

// pagina Giacenze per i due ruoli: il responsabile vede tutti i negozi e modifica,
// il dipendente vede solo il suo negozio (il server gli manda solo quello)
const Stocks = () => {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  const [stocks, setStocks] = useState([]);
  // negozi e prodotti servono solo al responsabile, per i filtri e il modulo
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  // filtri fatti nel browser: "" = nessun filtro
  const [filters, setFilters] = useState({ search: "", store: "", level: "" });
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: stockToEdit è la riga da modificare (null = nuova)
  const [showForm, setShowForm] = useState(false);
  const [stockToEdit, setStockToEdit] = useState(null);
  // conferma dell'eliminazione
  const [stockToDelete, setStockToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // su telefono le card, da tablet in su la tabella
  const isPhone = useIsPhone();

  // le giacenze, e di nuovo dopo ogni salvataggio (refreshCount)
  useEffect(() => {
    loadData("/stocks", (data) => setStocks(data.stocks), setError);
  }, [refreshCount]);

  // negozi e prodotti una volta sola, solo per il responsabile
  useEffect(() => {
    if (!isAdmin) return;
    loadData("/stores", (data) => setStores(data.stores), setError);
    loadData("/products", (data) => setProducts(data.products), setError);
  }, [isAdmin]);

  const changeFilter = (name, value) =>
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));

  const openNewForm = () => {
    setStockToEdit(null);
    setShowForm(true);
  };

  const openEditForm = (stock) => {
    setStockToEdit(stock);
    setShowForm(true);
  };

  // dopo il salvataggio chiudo e ricarico (il server rimanda la riga senza nomi)
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStock(stockToDelete._id);
      setStocks((prevStocks) =>
        prevStocks.filter((stock) => stock._id !== stockToDelete._id),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
      setStockToDelete(null);
    }
  };

  // in ordine di prodotto e poi di negozio; [...stocks] è una copia, sort non tocca lo stato
  const sortedStocks = [...stocks].sort(
    (first, second) =>
      first.product.name.localeCompare(second.product.name) ||
      first.store.name.localeCompare(second.store.name),
  );

  // le righe che passano tutti i filtri; la ricerca ignora maiuscole e minuscole
  const visibleStocks = sortedStocks.filter(
    (stock) =>
      stock.product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (!filters.store || stock.store._id === filters.store) &&
      (!filters.level || isLowStock(stock)),
  );
  const lowCount = stocks.filter(isLowStock).length;
  const storeOptions = toStoreOptions(stores);

  // sottotitolo: il responsabile vede quante righe, il dipendente il suo negozio
  const subtitleStart = isAdmin ? `${stocks.length} righe` : user.store?.name;

  // "Aggiungi riga": su telefono solo il "+" accanto al titolo, da tablet in su con il testo
  const addButton = (
    <AddButton label="Aggiungi riga" iconOnly={isPhone} onClick={openNewForm} />
  );

  // negozio (solo per il responsabile) e stato: sul computer in riga con la ricerca,
  // su telefono nel menu "Filtri" a destra del sottotitolo (in vista resta solo la ricerca)
  const storeFilter = isAdmin && (
    <FilterSelect
      label="Negozio"
      allLabel="Tutti i negozi"
      options={storeOptions}
      value={filters.store}
      onChange={(value) => changeFilter("store", value)}
    />
  );

  const levelFilter = (
    <FilterChips
      label="Stato"
      options={LEVEL_OPTIONS}
      value={filters.level}
      onChange={(value) => changeFilter("level", value)}
    />
  );

  // quanti filtri del menu sono attivi, per il pallino su "Filtri"
  const menuFilterCount = [filters.store, filters.level].filter(
    (value) => value !== "",
  ).length;

  // props uguali per tabella e card: i bottoni solo per il responsabile
  const listProps = {
    showStore: isAdmin,
    onEdit: isAdmin ? openEditForm : undefined,
    onDelete: isAdmin ? setStockToDelete : undefined,
  };

  return (
    <Container fluid>
      <PageHeader
        title="Giacenze"
        titleAside={isAdmin && isPhone && addButton}
        subtitle={`${subtitleStart} · ${lowCount} sotto soglia`}
        subtitleAside={
          isPhone && (
            <FilterBar compact activeCount={menuFilterCount}>
              {storeFilter}
              {levelFilter}
            </FilterBar>
          )
        }
        error={error}
      >
        {isAdmin && !isPhone && addButton}
      </PageHeader>

      {/* su telefono in vista solo la ricerca; da tablet in su anche negozio e stato */}
      <FilterBar>
        {!isPhone && storeFilter}
        <FilterSearch
          label="Cerca..."
          value={filters.search}
          onChange={(value) => changeFilter("search", value)}
        />
        {!isPhone && levelFilter}
      </FilterBar>

      {visibleStocks.length === 0 && !error && (
        <Message>Nessuna giacenza trovata</Message>
      )}

      {/* telefono: card una sotto l'altra; da tablet in su: la tabella */}
      {visibleStocks.length > 0 &&
        (isPhone ? (
          <div className="d-flex flex-column gap-3">
            {visibleStocks.map((stock) => (
              <StockCard key={stock._id} stock={stock} {...listProps} />
            ))}
          </div>
        ) : (
          <StockTable stocks={visibleStocks} {...listProps} />
        ))}

      {isAdmin && (
        <>
          <FormModal
            show={showForm}
            title={stockToEdit ? "Modifica giacenza" : "Nuova giacenza"}
            onClose={() => setShowForm(false)}
          >
            <StockForm
              stock={stockToEdit}
              stores={stores}
              products={products}
              stocks={stocks}
              onSaved={handleSaved}
              onCancel={() => setShowForm(false)}
            />
          </FormModal>

          <ConfirmDialog
            show={!!stockToDelete}
            title="Eliminare la riga?"
            message={`"${stockToDelete?.product.name}" non comparirà più nelle giacenze di ${stockToDelete?.store.name}. Non si può annullare.`}
            confirmLabel="Elimina"
            isLoading={isDeleting}
            onConfirm={confirmDelete}
            onCancel={() => setStockToDelete(null)}
          />
        </>
      )}
    </Container>
  );
};

export default Stocks;
