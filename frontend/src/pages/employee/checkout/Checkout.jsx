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

import Badge from "../../../components/common/badge/Badge";
import Button from "../../../components/common/button/Button";
import Message from "../../../components/common/message/Message";
import PageHeader from "../../../components/common/pageHeader/PageHeader";
import FilterBar from "../../../components/common/filterBar/FilterBar";
import FilterChips from "../../../components/common/filterBar/FilterChips";
import FilterSearch from "../../../components/common/filterBar/FilterSearch";
import Panel from "../../../components/common/panel/Panel";
import ProductCard from "../../../components/products/productCard/ProductCard";

// i due modi di pagare: value è quello che il backend si aspetta
const PAYMENT_OPTIONS = [
  { value: "cash", label: "Contanti" },
  { value: "card", label: "Carta" },
];

// pagina Cassa, solo per il dipendente: a sinistra i prodotti del catalogo,
// a destra il carrello sempre in vista. Si usa da tablet o computer
const Checkout = () => {
  const { user } = useAuth();
  // su telefono la cassa non si usa: mostro solo un messaggio
  const isPhone = useIsPhone();

  // i prodotti (il server manda al dipendente solo quelli attivi)
  // e le giacenze del suo negozio, per i pezzi disponibili sulle card
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState("");
  // filtri fatti nel browser: "" = nessun filtro
  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });
  // il carrello: una riga per prodotto, { product, quantity }
  const [cart, setCart] = useState([]);
  // come si paga: parte da contanti
  const [paymentMethod, setPaymentMethod] = useState("cash");
  // true mentre la vendita va al server: spegne i bottoni
  const [isSaving, setIsSaving] = useState(false);
  // "Vendita registrata" dopo una vendita riuscita
  const [successMessage, setSuccessMessage] = useState("");
  // aumentarlo ricarica prodotti e giacenze (dopo una vendita i pezzi cambiano)
  const [refreshCount, setRefreshCount] = useState(0);
  // i prodotti scesi sotto la soglia con l'ultima vendita (li manda il server)
  const [lowStockItems, setLowStockItems] = useState([]);

  // prodotti e giacenze all'apertura della pagina, e di nuovo quando cambia refreshCount
  useEffect(() => {
    loadData("/products", (data) => setProducts(data.products), setError);
    loadData("/stocks", (data) => setStocks(data.stocks), setError);
  }, [refreshCount]);

  // su telefono esco subito con il messaggio. Il return sta dopo gli hook:
  // React vuole che siano chiamati sempre tutti e nello stesso ordine.
  // Dal menu del telefono la Cassa non c'è, ma l'indirizzo si può aprire lo stesso
  if (isPhone) {
    return (
      <Container fluid>
        <PageHeader title="Cassa" subtitle={user.store?.name} />
        <Message>La cassa si usa da tablet o computer</Message>
      </Container>
    );
  }

  // cambia un filtro: copio gli altri e sovrascrivo quello ([name] usa il valore come chiave)
  const changeFilter = (name, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // i pezzi del negozio per un prodotto (0 se non c'è la giacenza).
  // find dà il primo elemento che va bene, oppure undefined: ?. evita l'errore e ?? mette 0
  const getAvailable = (productId) =>
    stocks.find((stock) => stock.product._id === productId)?.amount ?? 0;

  // quanti pezzi di quel prodotto ci sono già nel carrello (0 se non c'è)
  const getInCart = (productId) =>
    cart.find((line) => line.product._id === productId)?.quantity ?? 0;

  // "Aggiungi" su una card: se il prodotto è già nel carrello aumento di 1 la sua riga,
  // altrimenti aggiungo una riga nuova con quantità 1
  const addToCart = (product) => {
    // inizia una vendita nuova: tolgo i messaggi di quella prima
    setSuccessMessage("");
    setLowStockItems([]);
    if (getInCart(product._id) > 0) {
      // map crea un carrello nuovo: cambio solo la riga di quel prodotto, le altre restano uguali
      setCart((prevCart) =>
        prevCart.map((line) =>
          line.product._id === product._id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        ),
      );
    } else {
      // copio le righe che ci sono già e metto la nuova in fondo
      setCart((prevCart) => [...prevCart, { product, quantity: 1 }]);
    }
  };

  // − e + su una riga: change vale -1 o +1. Se si arriva a 0 la riga sparisce
  const changeQuantity = (productId, change) => {
    setCart((prevCart) =>
      prevCart
        .map((line) =>
          line.product._id === productId
            ? { ...line, quantity: line.quantity + change }
            : line,
        )
        // tengo solo le righe con almeno un pezzo
        .filter((line) => line.quantity > 0),
    );
  };

  // cestino: tengo tutte le righe tranne quella
  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((line) => line.product._id !== productId),
    );
  };

  // carrello vuoto e pagamento di nuovo in contanti: si riparte da zero.
  // La usano "Svuota il carrello" e la vendita riuscita
  const clearCart = () => {
    setCart([]);
    setPaymentMethod("cash");
  };

  // "Conferma vendita": mando il carrello al server, che scala i pezzi dal negozio.
  // isSaving spegne i bottoni mentre aspetto, così un doppio clic non registra due vendite
  const confirmSale = async () => {
    setIsSaving(true);
    setError("");
    setSuccessMessage("");
    setLowStockItems([]);
    try {
      const { lowStock } = await createSale({
        // al server servono solo l'_id del prodotto e la quantità, non tutto il prodotto
        items: cart.map((line) => ({
          product: line.product._id,
          quantity: line.quantity,
        })),
        paymentMethod,
      });
      // vendita fatta: carrello vuoto, messaggio, e ricarico le giacenze
      clearCart();
      setSuccessMessage("Vendita registrata");
      // i prodotti scesi sotto la soglia con questa vendita (lista vuota se nessuno)
      setLowStockItems(lowStock);
      setRefreshCount((prevCount) => prevCount + 1);
    } catch (e) {
      // per esempio pezzi non sufficienti: il carrello resta com'era
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // valori calcolati

  // le categorie senza doppioni (new Set), prese dai prodotti
  const categories = [...new Set(products.map((product) => product.category))];

  // i prodotti che passano la ricerca e la categoria; la ricerca ignora maiuscole e minuscole
  const visibleProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      (!filters.category || product.category === filters.category),
  );

  // i pulsanti delle categorie: "Tutti" lo aggiungo io (FilterChips non lo mette da solo),
  // poi una per categoria con la maiuscola ("libri" → "Libri")
  const categoryOptions = [
    { value: "", label: "Tutti" },
    ...categories.map((category) => ({
      value: category,
      label: category[0].toUpperCase() + category.slice(1),
    })),
  ];

  // quanti pezzi ci sono nel carrello in tutto (non quante righe): 2 guide + 1 magnete = 3.
  // reduce parte da 0 e a ogni riga aggiunge la sua quantità
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  // "1 articolo", "3 articoli"
  const cartLabel = cartCount === 1 ? "articolo" : "articoli";
  // il totale da pagare: prezzo × quantità di ogni riga, sommati
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

      {/* ricerca e categorie in pulsanti: in cassa si sceglie con un tocco */}
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

      {/* due colonne: i prodotti a sinistra, il carrello a destra */}
      <Row className="g-4">
        <Col md={7} xl={8}>
          {/* il messaggio solo quando nessun prodotto passa i filtri */}
          {visibleProducts.length === 0 && !error && (
            <Message>Nessun prodotto</Message>
          )}

          {/* due card per riga su tablet, tre da xl. A ogni card solo le giacenze
              del suo prodotto: per il dipendente una sola, quella del suo negozio */}
          <Row xs={2} xl={3} className="g-3">
            {visibleProducts.map((product) => (
              <Col key={product._id}>
                <ProductCard
                  product={product}
                  stocks={stocks.filter(
                    (stock) => stock.product._id === product._id,
                  )}
                  onAdd={addToCart}
                  // spento quando nel carrello ci sono già tutti i pezzi del negozio
                  addDisabled={
                    getInCart(product._id) >= getAvailable(product._id)
                  }
                />
              </Col>
            ))}
          </Row>
        </Col>

        {/* il carrello: checkout-cart lo tiene fermo mentre si scorrono i prodotti */}
        <Col md={5} xl={4}>
          <Panel
            title={`Carrello · ${cartCount} ${cartLabel}`}
            className="checkout-cart"
          >
            {/* dopo una vendita riuscita: spunta magenta e testo, dentro il carrello così resta in vista */}
            {successMessage && (
              <p className="checkout-cart-success" role="status">
                <span className="checkout-cart-success-icon" aria-hidden="true">
                  <Check size={16} />
                </span>
                {successMessage}
              </p>
            )}

            {/* dopo la vendita: i prodotti rimasti sotto la soglia, come le righe del carrello */}
            {lowStockItems.length > 0 && (
              <div className="checkout-cart-low" role="status">
                <p className="checkout-cart-low-title">Da riordinare</p>
                <ul className="checkout-cart-list">
                  {/* item.product è già l'_id (il server non manda tutto il prodotto) */}
                  {lowStockItems.map((item) => (
                    <li key={item.product} className="checkout-cart-line">
                      <span className="checkout-cart-name">{item.name}</span>
                      <Badge color="warning">{item.amount} pz</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* carrello vuoto: il messaggio, ma non subito dopo una vendita */}
            {cart.length === 0 && !successMessage && (
              <Message>Il carrello è vuoto</Message>
            )}

            {/* una riga per prodotto: nome e "quantità × prezzo" a sinistra, totale della riga a destra */}
            {cart.length > 0 && (
              <>
                <ul className="checkout-cart-list">
                  {cart.map((line) => (
                    <li key={line.product._id} className="checkout-cart-line">
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
                      {/* − / + e cestino. Il + si spegne come "Aggiungi": pezzi finiti */}
                      <div className="checkout-cart-controls">
                        <Button
                          variant="secondary"
                          className="app-button-icon"
                          aria-label={`Togli un pezzo di ${line.product.name}`}
                          onClick={() => changeQuantity(line.product._id, -1)}
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
                          onClick={() => changeQuantity(line.product._id, 1)}
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
                {/* il totale e sotto pagamento e bottoni */}
                <div className="checkout-cart-total">
                  <span>Totale</span>
                  <strong>{formatEuro(total)}</strong>
                </div>
                <div className="checkout-cart-actions">
                  <FilterChips
                    label="Pagamento"
                    options={PAYMENT_OPTIONS}
                    value={paymentMethod}
                    onChange={setPaymentMethod}
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
    </Container>
  );
};

export default Checkout;
