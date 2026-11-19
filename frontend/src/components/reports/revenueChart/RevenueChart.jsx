// import
import "./revenueChart.css";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatEuro } from "../../../utils/formatEuro";

// numeri brevi per l'asse: 1250 → "1,3k €"
const formatShortEuro = (value) =>
  value >= 1000
    ? `${(value / 1000).toLocaleString("it-IT", { maximumFractionDigits: 1 })}k €`
    : `${value} €`;

// componente ChartTooltip: il riquadro sopra la barra (periodo, incasso, vendite).
// Recharts gli passa active (sopra una barra) e payload (i dati della barra)
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const bar = payload[0].payload;
  return (
    <div className="revenue-chart-tooltip">
      <strong>{bar.title}</strong>
      <span>{formatEuro(bar.revenue)}</span>
      <span>
        {bar.salesCount} {bar.salesCount === 1 ? "vendita" : "vendite"}
      </span>
    </div>
  );
};

// componente RevenueChart: grafico a barre degli incassi (Recharts).
// props: bars = [{ label, title, revenue, salesCount }] di buildReportSeries; i colori sono nel CSS
const RevenueChart = ({ bars }) => {
  return (
    // ResponsiveContainer: tutta la larghezza del riquadro
    <div className="revenue-chart">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={bars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {/* solo le righe orizzontali */}
          <CartesianGrid vertical={false} />
          {/* con tante barre salta qualche etichetta ma tiene la prima e l'ultima */}
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatShortEuro}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<ChartTooltip />} />
          {/* barre arancio (nel CSS), angoli tondi solo in alto */}
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
