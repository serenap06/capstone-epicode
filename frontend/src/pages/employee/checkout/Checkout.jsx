// import
import "./checkout.css";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Check, Minus, Plus, Trash2 } from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import { useIsPhone } from "../../../hooks/useIsPhone";
import { loadData } from "../../../api/loadData";
import { createSale } from "../../../api/sales";
import { formatEuro } from "../../../utils/formatEuro";
import { formatFullName } from "../../../utils/formatFullName";
import { getCategories } from "../../../utils/getCategories";
import { toCategoryOptions } from "../../../utils/toCategoryOptions";

import Badge from "../../../components/common/badge/Badge";
import Button from "../../../components/common/button/Button";
import FilterBar from "../../../components/common/filterBar/FilterBar";
import FilterChips from "../../../components/common/filterBar/FilterChips";
import FilterSearch from "../../../components/common/filterBar/FilterSearch";
import FormModal from "../../../components/common/formModal/FormModal";
import Loader from "../../../components/common/loader/Loader";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import Panel from "../../../components/common/panel/Panel";
import CashSessionBar from "../../../components/cashSessions/cashSessionBar/CashSessionBar";
import CloseCashForm from "../../../components/cashSessions/closeCashForm/CloseCashForm";
import OpenCashForm from "../../../components/cashSessions/openCashForm/OpenCashForm";
import CheckoutProductCard from "../../../components/products/checkoutProductCard/CheckoutProductCard";

// i due modi di pagare (value = quello che vuole il backend)
const PAYMENT_OPTIONS = [
  { value: "cash", label: "Contanti" },
  { value: "card", label: "Carta" },
];

// componente Checkout: la Cassa del dipendente (tablet e computer). In cima apertura e chiusura,
// sotto prodotti e carrello, solo a cassa aperta
const Checkout = () => {
  // utente collegato
  const { user } = useAuth();
  // su telefono la cassa non si usa
  const isPhone = useIsPhone();

  // prodotti attivi e giacenze del mio negozio
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState("");
  // true fino ai primi dati: gira la rotellina
  const [isLoading, setIsLoading] = useState(true);
  // filtri fatti nel browser ("" = nessuno)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });
  // carrello: una riga per prodotto, { product, quantity }
  const [cart, setCart] = useState([]);
  // pagamento, di base contanti
  const [paymentMethod, setPaymentMethod] = useState("cash");
  // true mentre la vendita va al server
  const [isSaving, setIsSaving] = useState(false);
  // "Vendita registrata"
  const [successMessage, setSuccessMessage] = useState("");
  // aumentarlo ricarica prodotti, giacenze e cassa
  const [refreshCount, setRefreshCount] = useState(0);
  // prodotti finiti sotto soglia con l'ultima vendita
  const [lowStockItems, setLowStockItems] = useState([]);
  // cassa di oggi: { cashSession (null se da aprire), lastClosingFloat, cashSales, cardSales }
  const [cashToday, setCashToday] = useState(null);
  // modulo della cassa aperto: "open", "close" o null
  const [cashForm, setCashForm] = useState(null);

  // prendo prodotti, giacenze e cassa di oggi all'apertura e al refreshCount
  useEffect(() => {
    Promise.all([
      loadData("/products", (data) => setProducts(data.products), setError),
      loadData("/stocks", (data) => setStocks(data.stocks), setError),
      loadData("/cash-sessions/today", setCashToday, setError),
    ]).finally(() => setIsLoading(false));
  }, [refreshCount]);

  // su telefono solo il messaggio (il return va dopo gli hook: React li vuole sempre tutti)
  if (isPhone) {
    return (
      <Container fluid>
        <PageHeader title="Cassa" subtitle={user.store?.name} />
        <Message>La cassa si usa da tablet o computer</Message>
      </Container>
    );
  }

  // cambio un filtro e tengo gli altri
  const changeFilter = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // pezzi del negozio per un prodotto (0 se non c'è)
  const getAvailable = (productId) =>
    stocks.find((stock) => stock.product._id === productId)?.amount ?? 0;

  // pezzi di quel prodotto già nel carrello
  const getInCart = (productId) =>
    cart.find((line) => line.product._id === productId)?.quantity ?? 0;

  // "Aggiungi": +1 alla riga del prodotto, oppure una riga nuova
  const addToCart = (product) => {
    // vendita nuova: tolgo i messaggi di prima
    setSuccessMessage("");
    setLowStockItems([]);
    if (getInCart(product._id) > 0) {
      // cambio solo la riga di quel prodotto
      setCart((prevCart) =>
        prevCart.map((line) =>
          line.product._id === product._id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        ),
      );
    } else {
      // riga nuova in fondo
      setCart((prevCart) => [...prevCart, { product, quantity: 1 }]);
    }
  };

  // − e +: change è -1 o +1; a 0 la riga sparisce
  const changeQuantity = (productId, change) => {
    setCart((prevCart) =>
      prevCart
        .map((line) =>
          line.product._id === productId
            ? { ...line, quantity: line.quantity + change }
            : line,
        )
        // solo le righe con almeno un pezzo
        .filter((line) => line.quantity > 0),
    );
  };

  // cestino: tolgo la riga
  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((line) => line.product._id !== productId),
    );
  };

  // svuoto il carrello e rimetto i contanti
  const clearCart = () => {
    setCart([]);
    setPaymentMethod("cash");
  };

  // "Conferma vendita": mando il carrello al server (isSaving evita le vendite doppie)
  const confirmSale = async () => {
    setIsSaving(true);
    setError("");
    setSuccessMessage("");
    setLowStockItems([]);
    try {
      const { lowStock } = await createSale({
        // al server bastano id e quantità
        items: cart.map((line) => ({
          product: line.product._id,
          quantity: line.quantity,
        })),
        paymentMethod,
      });
      // fatto: carrello vuoto e messaggio
      clearCart();
      setSuccessMessage("Vendita registrata");
      // prodotti finiti sotto soglia (vuoto se nessuno)
      setLowStockItems(lowStock);
      setRefreshCount((prevCount) => prevCount + 1);
    } catch (e) {
      // es. pezzi insufficienti: il carrello resta
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // cassa aperta o chiusa: chiudo il modulo, svuoto il carrello e ricarico
  const handleCashSaved = () => {
    setCashForm(null);
    clearCart();
    setSuccessMessage("");
    setLowStockItems([]);
    setRefreshCount((prevCount) => prevCount + 1);
  };

  // valori calcolati

  // cassa di oggi; si vende solo se è aperta e non ancora chiusa
  const cashSession = cashToday?.cashSession ?? null;
  const canSell = !!cashSession && !cashSession.closedAt;

  // categorie senza doppioni
  const categories = getCategories(products);

  // prodotti che passano ricerca e categoria
  const visibleProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (!filters.category || product.category === filters.category),
  );

  // pulsanti delle categorie: "Tutti" più una per categoria
  const categoryOptions = [
    { value: "", label: "Tutti" },
    ...toCategoryOptions(categories),
  ];

  // filtri attivi, per il messaggio
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;

  // pezzi nel carrello (non righe): 2 guide + 1 magnete = 3
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  // "1 articolo", "3 articoli"
  const cartLabel = cartCount === 1 ? "articolo" : "articoli";
  // totale: prezzo × quantità di ogni riga
  const total = cart.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  );

  return (
    <Container fluid>
      {/* sotto il titolo il negozio e chi è alla cassa */}
      <PageHeader
        title="Cassa"
        subtitle={`${user.store?.name} · ${formatFullName(user)}`}
        error={error}
      />

      {/* la cassa di oggi, con il bottone per aprirla o chiuderla */}
      {cashToday && (
        <CashSessionBar
          cashSession={cashSession} // null se da aprire
          cashSales={cashToday.cashSales} // incasso contanti di oggi
          onOpen={() => setCashForm("open")} // apro il modulo di apertura
          onClose={() => setCashForm("close")} // apro il modulo di chiusura
        />
      )}

      {/* rotellina, poi il messaggio se non si può vendere */}
      {isLoading && <Loader />}
      {cashToday && !canSell && (
        <Message>
          {cashSession
            ? "La cassa di oggi è chiusa: si riapre domani"
            : "Apri la cassa per iniziare a vendere"}
        </Message>
      )}

      {/* prodotti e carrello solo a cassa aperta */}
      {canSell && (
        <>
          {/* ricerca e categorie a pulsanti: in cassa si sceglie con un tocco */}
          <FilterBar>
            <FilterSearch
              label="Cerca un prodotto"
              value={filters.search}
              onChange={(value) => changeFilter("search", value)}
            />
            <FilterChips
              label="Categoria"
              options={categoryOptions}
              value={filters.category}
              onChange={(value) => changeFilter("category", value)}
            />
          </FilterBar>

          {/* prodotti a sinistra, carrello a destra */}
          <Row className="g-4">
            <Col md={7} xl={8}>
              {/* messaggio se nessun prodotto passa i filtri */}
              {visibleProducts.length === 0 && !error && (
                <Message>
                  {activeFilterCount > 0
                    ? "Nessun prodotto con questi filtri"
                    : "Nessun prodotto"}
                </Message>
              )}

              {/* card compatte: due per riga su tablet, tre da xl */}
              <Row xs={2} xl={3} className="g-3">
                {visibleProducts.map((product) => (
                  <Col key={product._id}>
                    <CheckoutProductCard
                      product={product} // il prodotto della card
                      stock={stocks.find(
                        (stock) => stock.product._id === product._id,
                      )}
                      onAdd={addToCart} // aggiungo un pezzo al carrello
                      // spento quando nel carrello ci sono tutti i pezzi del negozio
                      addDisabled={
                        getInCart(product._id) >= getAvailable(product._id)
                      }
                    />
                  </Col>
                ))}
              </Row>
            </Col>

            {/* carrello fermo mentre scorro i prodotti */}
            <Col md={5} xl={4}>
              <Panel
                title={`Carrello · ${cartCount} ${cartLabel}`}
                className="checkout-cart"
              >
                {/* dopo una vendita: spunta e testo, dentro il carrello */}
                {successMessage && (
                  <p className="checkout-cart-success" role="status">
                    <span
                      className="checkout-cart-success-icon"
                      aria-hidden="true"
                    >
                      <Check size={16} />
                    </span>
                    {successMessage}
                  </p>
                )}

                {/* prodotti finiti sotto soglia con la vendita */}
                {lowStockItems.length > 0 && (
                  <div className="checkout-cart-low" role="status">
                    <p className="checkout-cart-low-title">Da riordinare</p>
                    <ul className="checkout-cart-list">
                      {/* item.product è già l'id */}
                      {lowStockItems.map((item) => (
                        <li key={item.product} className="checkout-cart-line">
                          <span className="checkout-cart-name">
                            {item.name}
                          </span>
                          <Badge color="warning">{item.amount} pz</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* carrello vuoto (ma non subito dopo una vendita) */}
                {cart.length === 0 && !successMessage && (
                  <Message>Il carrello è vuoto</Message>
                )}

                {/* una riga per prodotto: nome e "quantità × prezzo", totale a destra */}
                {cart.length > 0 && (
                  <>
                    <ul className="checkout-cart-list">
                      {cart.map((line) => (
                        <li
                          key={line.product._id}
                          className="checkout-cart-line"
                        >
                          <div>
                            <p className="checkout-cart-name">
                              {line.product.name}
                            </p>
                            <p className="checkout-cart-detail">
                              {line.quantity} × {formatEuro(line.product.price)}
                            </p>
                          </div>
                          <span className="checkout-cart-price">
                            {formatEuro(line.product.price * line.quantity)}
                          </span>
                          {/* − / + e cestino (il + si spegne a pezzi finiti) */}
                          <div className="checkout-cart-controls">
                            <Button
                              variant="secondary"
                              className="app-button-icon"
                              aria-label={`Togli un pezzo di ${line.product.name}`}
                              onClick={() =>
                                changeQuantity(line.product._id, -1)
                              }
                            >
                              <Minus size={16} aria-hidden="true" />
                            </Button>
                            <span className="checkout-cart-quantity">
                              {line.quantity}
                            </span>
                            <Button
                              variant="secondary"
                              className="app-button-icon"
                              aria-label={`Aggiungi un pezzo di ${line.product.name}`}
                              onClick={() =>
                                changeQuantity(line.product._id, 1)
                              }
                              disabled={
                                line.quantity >= getAvailable(line.product._id)
                              }
                            >
                              <Plus size={16} aria-hidden="true" />
                            </Button>
                            <Button
                              variant="danger"
                              className="app-button-icon"
                              aria-label={`Togli ${line.product.name} dal carrello`}
                              onClick={() => removeFromCart(line.product._id)}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {/* totale, pagamento e bottoni */}
                    <div className="checkout-cart-total">
                      <span>Totale</span>
                      <strong>{formatEuro(total)}</strong>
                    </div>
                    <div className="checkout-cart-actions">
                      <FilterChips
                        label="Pagamento"
                        options={PAYMENT_OPTIONS}
                        value={paymentMethod}
                        onChange={setPaymentMethod} // contanti o carta
                      />
                      <Button onClick={confirmSale} disabled={isSaving}>
                        {isSaving ? "Registrazione..." : "Conferma vendita"}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={clearCart}
                        disabled={isSaving}
                      >
                        Svuota il carrello
                      </Button>
                    </div>
                  </>
                )}
              </Panel>
            </Col>
          </Row>
        </>
      )}

      {/* modulo per aprire la cassa (si riapre sempre nuovo) */}
      <FormModal
        show={cashForm === "open"}
        title="Apri la cassa"
        onClose={() => setCashForm(null)}
      >
        {cashForm === "open" && (
          <OpenCashForm
            lastClosingFloat={cashToday.lastClosingFloat} // il fondo proposto
            onSaved={handleCashSaved} // chiudo e ricarico
            onCancel={() => setCashForm(null)}
          />
        )}
      </FormModal>

      {/* modulo per chiudere la cassa */}
      <FormModal
        show={cashForm === "close"}
        title="Chiudi la cassa"
        onClose={() => setCashForm(null)}
      >
        {cashForm === "close" && (
          <CloseCashForm
            cashSession={cashSession} // la cassa di oggi
            cashSales={cashToday.cashSales} // incasso contanti di oggi
            cardSales={cashToday.cardSales} // incasso POS di oggi
            onSaved={handleCashSaved} // chiudo e ricarico
            onCancel={() => setCashForm(null)}
          />
        )}
      </FormModal>
    </Container>
  );
};

export default Checkout;
