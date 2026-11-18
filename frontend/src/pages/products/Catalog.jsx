import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import { useAuth } from "../../hooks/useAuth";
import { useIsPhone } from "../../hooks/useIsPhone";
import { loadData } from "../../api/loadData";
import { deleteProduct } from "../../api/products";
import { getCategories } from "../../utils/getCategories";
import { toCategoryOptions } from "../../utils/toCategoryOptions";

import AddButton from "../../components/common/addButton/AddButton";
import ConfirmDialog from "../../components/common/confirmDialog/ConfirmDialog";
import FilterBar from "../../components/common/filterBar/FilterBar";
import FilterChips from "../../components/common/filterBar/FilterChips";
import FilterSearch from "../../components/common/filterBar/FilterSearch";
import FilterSelect from "../../components/common/filterBar/FilterSelect";
import FormModal from "../../components/common/formModal/FormModal";
import Loader from "../../components/common/loader/Loader";
import Message from "../../components/common/message/Message";
import PageHeader from "../../components/common/pageHeader/PageHeader";
import ProductCard from "../../components/products/productCard/ProductCard";
import ProductForm from "../../components/products/productForm/ProductForm";

// filtro dello stato, solo per il responsabile ("" = tutti)
const STATE_OPTIONS = [
  { value: "", label: "Tutti" },
  { value: "active", label: "Attivi" },
  { value: "inactive", label: "Non attivi" },
];

// pagina Catalogo per i due ruoli: il responsabile vede tutti i prodotti e li gestisce,
// il dipendente vede solo quelli attivi (il server gli manda solo quelli)
const Catalog = () => {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  // su telefono il "+" accanto al titolo e i filtri nel menu "Filtri"
  const isPhone = useIsPhone();

  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  // true finché i dati non arrivano la prima volta: intanto gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // le giacenze: al responsabile di tutti i negozi, al dipendente solo del suo
  const [stocks, setStocks] = useState([]);
  // filtri fatti nel browser: "" = nessun filtro
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    state: "",
  });
  // aumentarlo ricarica i prodotti (dopo un salvataggio)
  const [refreshCount, setRefreshCount] = useState(0);
  // modale del modulo: productToEdit è il prodotto da modificare (null = nuovo)
  const [showForm, setShowForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  // conferma dell'eliminazione: il prodotto da eliminare, oppure null
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // prodotti e giacenze, e di nuovo quando cambia refreshCount
  // Promise.all aspetta tutte e due le richieste, poi finally spegne la rotellina
  useEffect(() => {
    Promise.all([
      loadData("/products", (data) => setProducts(data.products), setError),
      // i pezzi stanno nelle giacenze, non nei prodotti: servono per la riga sulla card
      loadData("/stocks", (data) => setStocks(data.stocks), setError),
    ]).finally(() => setIsLoading(false));
  }, [refreshCount]);

  // cambia un filtro: copio gli altri e sovrascrivo quello ([name] usa il valore come chiave)
  const changeFilter = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // "Nuovo prodotto": modale con il modulo vuoto
  const openNewForm = () => {
    setProductToEdit(null);
    setShowForm(true);
  };
  // matita sulla card: modale con i dati di quel prodotto
  const openEditForm = (product) => {
    setProductToEdit(product);
    setShowForm(true);
  };
  // dopo il salvataggio chiudo e ricarico: la foto arriva con una seconda richiesta,
  // così la lista torna dal server già completa
  const handleSaved = () => {
    setShowForm(false);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // elimino sul server e tolgo il prodotto dalla lista; finally chiude sempre la conferma
  const confirmDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await deleteProduct(productToDelete._id);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productToDelete._id),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  // valori calcolati

  // le categorie senza doppioni, per il filtro e per il modulo
  const categories = getCategories(products);
  // le categorie per il menu a tendina ("Tutte le categorie" la aggiunge FilterSelect)
  const categoryOptions = toCategoryOptions(categories);

  // i prodotti che passano tutti i filtri; la ricerca ignora maiuscole e minuscole
  const visibleProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.state ||
        (filters.state === "active" ? product.active : !product.active)),
  );

  // quanti prodotti non sono attivi, per il sottotitolo del responsabile
  const inactiveCount = products.filter((product) => !product.active).length;

  // quanti filtri sono attivi in tutto, per il messaggio "con questi filtri"
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;
  // quanti filtri del menu sono attivi, per il pallino su "Filtri"
  const menuFilterCount = [filters.category, filters.state].filter(
    (value) => value !== "",
  ).length;

  // "1 non attivo", "2 non attivi"
  const inactiveLabel = inactiveCount === 1 ? "non attivo" : "non attivi";
  // il responsabile vede anche i non attivi; il dipendente il suo negozio e quanti prodotti ha
  const subtitle = isAdmin
    ? `${products.length} prodotti · ${inactiveCount} ${inactiveLabel}`
    : `${user.store?.name} · ${products.length} prodotti disponibili`;

  // i tre filtri scritti una volta: sul computer stanno in riga,
  // su telefono resta in vista la ricerca e gli altri vanno nel menu "Filtri"
  const searchFilter = (
    <FilterSearch
      label="Cerca un prodotto"
      value={filters.search}
      onChange={(value) => changeFilter("search", value)}
    />
  );
  // la categoria come menu a tendina
  const categoryFilter = (
    <FilterSelect
      label="Categoria"
      allLabel="Tutte le categorie"
      options={categoryOptions}
      value={filters.category}
      onChange={(value) => changeFilter("category", value)}
    />
  );
  // lo stato solo per il responsabile: per il dipendente vale false e non disegna niente
  const stateFilter = isAdmin && (
    <FilterChips
      label="Stato"
      options={STATE_OPTIONS}
      value={filters.state}
      onChange={(value) => changeFilter("state", value)}
    />
  );

  // "Nuovo prodotto": su telefono solo il "+" accanto al titolo, da tablet in su con il testo
  const addButton = (
    <AddButton
      label="Nuovo prodotto"
      iconOnly={isPhone}
      onClick={openNewForm}
    />
  );

  return (
    <Container fluid>
      <PageHeader
        title="Catalogo"
        titleAside={isAdmin && isPhone && addButton}
        subtitle={subtitle}
        subtitleAside={
          isPhone && (
            <FilterBar compact activeCount={menuFilterCount}>
              {categoryFilter}
              {stateFilter}
            </FilterBar>
          )
        }
        error={error}
      >
        {/* da tablet in su il bottone va a destra dell'intestazione */}
        {isAdmin && !isPhone && addButton}
      </PageHeader>

      {/* su telefono in vista solo la ricerca; da tablet in su anche categoria e stato */}
      <FilterBar>
        {searchFilter}
        {!isPhone && categoryFilter}
        {!isPhone && stateFilter}
      </FilterBar>

      {/* il messaggio solo quando nessun prodotto passa i filtri */}
      {isLoading && <Loader />}
      {!isLoading && visibleProducts.length === 0 && !error && (
        <Message>
          {activeFilterCount > 0
            ? "Nessun prodotto con questi filtri"
            : "Nessun prodotto"}
        </Message>
      )}

      {/* due card per riga su telefono, tre da tablet, quattro da xl.
          A ogni card passo solo le giacenze del suo prodotto; il responsabile vede anche il negozio.
          Matita e cestino solo per il responsabile: al dipendente passo undefined */}
      <Row xs={2} md={3} xl={4} className="g-3">
        {visibleProducts.map((product) => (
          <Col key={product._id}>
            <ProductCard
              product={product}
              stocks={stocks.filter(
                (stock) => stock.product._id === product._id,
              )}
              showStore={isAdmin}
              onEdit={isAdmin ? openEditForm : undefined}
              onDelete={isAdmin ? setProductToDelete : undefined}
            />
          </Col>
        ))}
      </Row>

      {/* modale e conferma servono solo al responsabile */}
      {isAdmin && (
        <>
          <FormModal
            show={showForm}
            title={productToEdit ? "Modifica prodotto" : "Nuovo prodotto"}
            onClose={() => setShowForm(false)}
          >
            <ProductForm
              product={productToEdit}
              categories={categories}
              onSaved={handleSaved}
              onCancel={() => setShowForm(false)}
            />
          </FormModal>

          {/* !! trasforma productToDelete in true/false; ?. perché a conferma chiusa è null */}
          <ConfirmDialog
            show={!!productToDelete}
            title="Eliminare il prodotto?"
            message={`"${productToDelete?.name}" verrà eliminato dal catalogo insieme alle sue giacenze e richieste di fornitura. Non si può annullare.`}
            confirmLabel="Elimina"
            isLoading={isDeleting}
            onConfirm={confirmDelete}
            onCancel={() => setProductToDelete(null)}
          />
        </>
      )}
    </Container>
  );
};

export default Catalog;
