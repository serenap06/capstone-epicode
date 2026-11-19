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

// numeri brevi per l'asse a sinistra: 1250 → "1,3k €", 800 → "800 €"
const formatShortEuro = (value) =>
  value >= 1000
    ? `${(value / 1000).toLocaleString("it-IT", { maximumFractionDigits: 1 })}k €`
    : `${value} €`;

// il riquadro che compare passando sopra una barra: periodo per esteso, incasso e
// numero di vendite. Recharts gli passa active (true sopra una barra) e payload (i dati della barra)
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

// grafico a barre dell'andamento degli incassi (Recharts).
// bars: [{ label, title, revenue, salesCount }] di buildReportSeries, una barra per periodo.
// Colori e testo del grafico sono in revenueChart.css, sulle classi che Recharts dà a ogni pezzo
const RevenueChart = ({ bars }) => {
  return (
    // ResponsiveContainer: il grafico prende tutta la larghezza del riquadro
    <div className="revenue-chart">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={bars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          {/* solo le linee orizzontali */}
          <CartesianGrid vertical={false} />
          {/* preserveStartEnd: con tante barre salta qualche etichetta ma tiene la prima e l'ultima */}
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
          {/* le barre (arancio, nel CSS); angoli tondi solo in alto */}
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
