import "./vatTable.css";

import { formatEuro } from "../../../utils/formatEuro";

// IVA per aliquota: per ogni aliquota il netto, l'IVA da versare e il totale incassato,
// più la riga dei totali. byVatRate: le righe del server ({ vatRate, netRevenue, vat, revenue })
const VatTable = ({ byVatRate }) => {
  // la riga "Totale": sommo le colonne
  const sumOf = (field) =>
    byVatRate.reduce((sum, row) => sum + row[field], 0);

  return (
    <div className="app-table-wrap">
      <table className="app-table vat-table">
        <thead>
          <tr>
            <th scope="col">Aliquota</th>
            {/* su telefono la colonna Netto si nasconde (vatTable.css): c'è già nella card in alto */}
            <th scope="col" className="text-end vat-table-net">
              Netto
            </th>
            <th scope="col" className="text-end">
              IVA
            </th>
            <th scope="col" className="text-end">
              Totale
            </th>
          </tr>
        </thead>
        <tbody>
          {byVatRate.map((row) => (
            <tr key={row.vatRate}>
              <td>{row.vatRate}%</td>
              <td className="text-end vat-table-net">
                {formatEuro(row.netRevenue)}
              </td>
              <td className="text-end">{formatEuro(row.vat)}</td>
              <td className="text-end">{formatEuro(row.revenue)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Totale</th>
            <td className="text-end vat-table-net">
              {formatEuro(sumOf("netRevenue"))}
            </td>
            <td className="text-end">{formatEuro(sumOf("vat"))}</td>
            <td className="text-end">{formatEuro(sumOf("revenue"))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default VatTable;
