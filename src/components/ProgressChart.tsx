import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useId } from "react";
import { dateLabel, numberLabel } from "../lib/metrics";
export function ProgressChart({
  data,
  unit,
  color = "#3875f6",
}: {
  data: { date: string; value: number }[];
  unit: string;
  color?: string;
}) {
  const id = useId().replace(/:/g, "");
  if (!data.length)
    return (
      <div className="chart-empty">
        Los próximos registros darán forma a tu progreso.
      </div>
    );
  return (
    <div
      className="chart"
      role="img"
      aria-label={`Evolución: ${data.length} registros. Último valor ${numberLabel(data.at(-1)?.value)} ${unit}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 12, left: 0, bottom: 4 }}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 5"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="date"
            tickFormatter={dateLabel}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
          />
          <YAxis
            domain={["auto", "auto"]}
            axisLine={false}
            tickLine={false}
            width={42}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
          />
          <Tooltip
            labelFormatter={(label) => dateLabel(String(label))}
            formatter={(value) => [
              `${numberLabel(Number(value))} ${unit}`,
              "Valor",
            ]}
            contentStyle={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text)",
            }}
          />
          <Area
            isAnimationActive={false}
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            fill={`url(#${id})`}
            dot={{ r: 3, fill: color, strokeWidth: 2, stroke: "var(--panel)" }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
