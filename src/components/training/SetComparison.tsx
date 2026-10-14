import type { Exercise, WeightUnit } from "../../types";
import { setComparison, comparisonLabels } from "../../lib/setProgress";
import { fromKg } from "../../lib/training";
import { numberLabel } from "../../lib/metrics";
import { t } from "../../lib/i18n";
const signed = (n: number) =>
  (n > 0.005 ? "+" : "") + numberLabel(Math.abs(n) < 0.005 ? 0 : n, 2);
export default function SetComparison({
  current,
  previous,
  unit,
}: {
  current: Exercise;
  previous?: Exercise;
  unit: WeightUnit;
}) {
  return (
    <div
      className="set-comparison-scroll"
      tabIndex={0}
      role="region"
      aria-label={t("Comparación por serie")}
    >
      <table className="set-comparison">
        <thead>
          <tr>
            <th>{t("Serie")}</th>
            <th>{t("Sesión de referencia")}</th>
            <th>{t("Sesión seleccionada")}</th>
            <th>{t("Cambio")}</th>
          </tr>
        </thead>
        <tbody>
          {setComparison(current, previous).map((row) => (
            <tr key={row.index} data-status={row.status}>
              <th scope="row">{row.index + 1}</th>
              <td>
                {row.previous
                  ? `${numberLabel(fromKg(row.previous.weight, unit), 2)} ${unit} × ${row.previous.reps}`
                  : "—"}
              </td>
              <td>
                {row.current
                  ? `${numberLabel(fromKg(row.current.weight, unit), 2)} ${unit} × ${row.current.reps}`
                  : "—"}
              </td>
              <td>
                <span className={`series-status ${row.status}`}>
                  {t(comparisonLabels[row.status])}
                </span>
                {row.weightDelta !== undefined && (
                  <small>
                    {signed(fromKg(row.weightDelta, unit))} {unit} ·{" "}
                    {signed(row.repsDelta!)} {t("rep")}
                  </small>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
