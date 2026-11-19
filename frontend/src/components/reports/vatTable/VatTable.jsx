// import
import "./vatTable.css";

import { formatEuro } from "../../../utils/formatEuro";

// componente VatTable: per ogni aliquota netto, IVA e totale, più la riga dei totali.
// props: byVatRate = le righe del server
const VatTable = ({ byVatRate }) => {
  // riga "Totale": sommo la colonna
  const sumOf = (field) => byVatRate.reduce((sum, row) => sum + row[field], 0);

  return (
    <div className="app-table-wrap">
      <table className="app-table vat-table">
        <thead>
          <tr>
            <th scope="col">Aliquota</th>
            {/* su telefono Netto si nasconde: c'è già nella card in alto */}
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
