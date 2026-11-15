import "./lowStockList.css";

// elenco dei prodotti sotto la soglia minima, nella dashboard del responsabile.
// stocks: le giacenze sotto scorta, ognuna con prodotto, negozio e quantità
const LowStockList = ({ stocks }) => {
  return (
    <div className="low-stock-list">
      {stocks.map((stock) => (
        <div key={stock._id} className="low-stock-row">
          {/* a sinistra nome del prodotto e negozio, a destra i pezzi rimasti */}
          <div className="low-stock-info">
            <span className="low-stock-name">{stock.product.name}</span>
            <span className="low-stock-store">{stock.store.name}</span>
          </div>
          <div>
            <span className="low-stock-amount">
              {stock.amount} pz
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LowStockList;
