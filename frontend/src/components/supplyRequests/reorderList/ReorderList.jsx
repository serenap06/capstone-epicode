import "./reorderList.css";
import { Plus } from "lucide-react";

import Button from "../../common/button/Button";
import Panel from "../../common/panel/Panel";

// "Da riordinare" del dipendente: i prodotti sotto soglia senza una richiesta in attesa.
// "Richiedi" apre il modulo con prodotto e quantità già scelti (onRequest)
const ReorderList = ({ stocks, onRequest }) => {
  return (
    <Panel
      title="Da riordinare"
      aside={
        <span className="reorder-count">{stocks.length} sotto soglia</span>
      }
      className="mb-4"
    >
      <ul className="reorder-list">
        {stocks.map((stock) => (
          <li key={stock._id} className="reorder-row">
            <div className="reorder-info">
              <span className="reorder-name">{stock.product.name}</span>
              <span className="reorder-detail">
                {stock.amount} pz · soglia {stock.minThreshold}
              </span>
            </div>
            <Button
              variant="secondary"
              aria-label={`Richiedi ${stock.product.name}`}
              onClick={() => onRequest(stock)}
            >
              <Plus size={16} aria-hidden="true" />
              Richiedi
            </Button>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

export default ReorderList;
