import "./lowStockList.css";

// prodotti sotto scorta nella dashboard: nome e negozio a sinistra, pezzi a destra
const LowStockList = ({ stocks }) => {
  return (
    <div className="low-stock-list">
      {stocks.map((stock) => (
        <div key={stock._id} className="low-stock-row">
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
