import { useId, useState } from "react";
import { Download, FileDown } from "lucide-react";
import { t, useLanguage } from "../lib/i18n";
import { dateLabel } from "../lib/metrics";

type ExportRecord = { id: string; date: string; time?: string };
export type ExportColumn<T> = {
  label: string;
  value: (record: T) => string | number;
};

function csvCell(value: string | number): string {
  const text = String(value);
  return /[;"\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export default function ExportRecords<T extends ExportRecord>({
  records,
  columns,
  fileName,
}: {
  records: T[];
  columns: ExportColumn<T>[];
  fileName: string;
}) {
  useLanguage();
  const id = useId();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const latestFirst = [...records].sort((a, b) =>
    (b.date + (b.time ?? "")).localeCompare(a.date + (a.time ?? "")),
  );
  const allSelected =
    latestFirst.length > 0 &&
    latestFirst.every((record) => selected.has(record.id));
  const selectedCount = latestFirst.filter((record) =>
    selected.has(record.id),
  ).length;

  function download() {
    const chosen = latestFirst.filter((record) => selected.has(record.id));
    if (!chosen.length) return;
    const header = [t("Fecha"), ...columns.map((column) => column.label)];
    const rows = chosen.map((record) => [
      record.date,
      ...columns.map((column) => column.value(record)),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(";"))
      .join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSelected(new Set());
  }

  return (
    <details className="panel export-panel">
      <summary>
        <span className="export-title">
          <FileDown size={18} /> {t("Exportar registros")}
        </span>
        <span className="muted small">
          {records.length} {t("registros")}
        </span>
      </summary>
      <div className="export-content">
        <p className="muted small">
          {t("Descarga tus datos en CSV, compatible con Excel.")}
        </p>
        {latestFirst.length ? (
          <>
            <label
              className="export-option export-select-all"
              htmlFor={`${id}-all`}
            >
              <input
                id={`${id}-all`}
                type="checkbox"
                checked={allSelected}
                onChange={() =>
                  setSelected(
                    allSelected
                      ? new Set()
                      : new Set(latestFirst.map((record) => record.id)),
                  )
                }
              />
              <span>{t("Seleccionar todos")}</span>
              <span className="muted">{latestFirst.length}</span>
            </label>
            <fieldset className="export-list">
              <legend className="sr-only">
                {t("Selecciona una o varias fechas.")}
              </legend>
              {latestFirst.map((record) => {
                const optionId = `${id}-${record.id}`;
                const when = `${dateLabel(record.date)} ${record.date.slice(0, 4)}${record.time ? ` · ${record.time}` : ""}`;
                return (
                  <label
                    className="export-option"
                    htmlFor={optionId}
                    key={record.id}
                  >
                    <input
                      id={optionId}
                      type="checkbox"
                      checked={selected.has(record.id)}
                      aria-label={t("Exportar registros del {0}", { 0: when })}
                      onChange={(event) =>
                        setSelected((previous) => {
                          const next = new Set(previous);
                          if (event.target.checked) next.add(record.id);
                          else next.delete(record.id);
                          return next;
                        })
                      }
                    />
                    <span>{when}</span>
                  </label>
                );
              })}
            </fieldset>
          </>
        ) : (
          <p className="muted small">{t("Sin registros para exportar.")}</p>
        )}
        <div className="export-footer">
          <span className="muted small">
            {t("Registros seleccionados: {0}", { 0: selectedCount })}
          </span>
          <button
            className="btn primary"
            type="button"
            disabled={!selectedCount}
            onClick={download}
          >
            <Download size={17} />{" "}
            {t("Descargar CSV ({0})", { 0: selectedCount })}
          </button>
        </div>
      </div>
    </details>
  );
}
