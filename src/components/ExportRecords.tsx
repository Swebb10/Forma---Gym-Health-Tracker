import { useId, useState } from "react";
import { FileDown } from "lucide-react";
import { getLocale, t, useLanguage } from "../lib/i18n";
import { dateLabel } from "../lib/metrics";

type ExportRecord = { id: string; date: string; time?: string };
export type ExportColumn<T> = {
  label: string;
  group: string;
  value: (record: T) => string | number;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export default function ExportRecords<T extends ExportRecord>({
  records,
  columns,
  fileName,
  reportTitle,
}: {
  records: T[];
  columns: ExportColumn<T>[];
  fileName: string;
  reportTitle: string;
}) {
  useLanguage();
  const id = useId();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [printError, setPrintError] = useState(false);
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
    setPrintError(false);
    const groups = new Map<string, ExportColumn<T>[]>();
    for (const column of columns) {
      const group = groups.get(column.group) ?? [];
      group.push(column);
      groups.set(column.group, group);
    }
    const numberFormat = new Intl.NumberFormat(getLocale(), {
      maximumFractionDigits: 2,
    });
    const generated = new Intl.DateTimeFormat(getLocale(), {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());
    const reportRecords = chosen
      .map((record, index) => {
        const metricGroups = [...groups]
          .map(
            ([group, fields]) => `
              <section class="metric-group">
                <h3>${escapeHtml(group)}</h3>
                <dl>${fields
                  .map((field) => {
                    const value = field.value(record);
                    const display =
                      typeof value === "number"
                        ? numberFormat.format(value)
                        : value === ""
                          ? "—"
                          : value;
                    return `<div><dt>${escapeHtml(field.label)}</dt><dd>${escapeHtml(String(display))}</dd></div>`;
                  })
                  .join("")}</dl>
              </section>`,
          )
          .join("");
        return `
          <article class="record">
            <header>
              <div><span class="eyebrow">${escapeHtml(reportTitle)}</span><h2>${escapeHtml(dateLabel(record.date))} ${escapeHtml(record.date.slice(0, 4))}</h2></div>
              ${record.time ? `<span class="time">${escapeHtml(record.time)}</span>` : ""}
            </header>
            <div class="groups">${metricGroups}</div>
          </article>${index < chosen.length - 1 ? '<div class="record-divider"></div>' : ""}`;
      })
      .join("");
    const title = fileName.replace(/\.pdf$/i, "");
    const html = `<!doctype html>
      <html lang="${escapeHtml(getLocale().slice(0, 2))}">
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title>
      <style>
        @page { size: A4; margin: 14mm; }
        * { box-sizing: border-box; }
        body { margin: 0 auto; max-width: 900px; color: #172337; background: #fff; font: 14px/1.5 Arial, sans-serif; }
        .report-head { border-bottom: 2px solid #2463eb; padding-bottom: 16px; margin-bottom: 24px; }
        .brand { color: #2463eb; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
        h1 { margin: 6px 0 4px; font-size: 27px; line-height: 1.2; }
        .subhead, .generated { color: #617086; }
        .generated { margin-top: 6px; font-size: 12px; }
        .record { break-inside: avoid-page; }
        .record > header { display: flex; justify-content: space-between; align-items: center; gap: 18px; margin: 0 0 14px; }
        .eyebrow { color: #2463eb; font-size: 10px; font-weight: 700; letter-spacing: 1.1px; text-transform: uppercase; }
        h2 { margin: 3px 0 0; font-size: 20px; }
        .time { padding: 5px 10px; border: 1px solid #dce4ef; border-radius: 20px; font-weight: 600; }
        .groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .metric-group { break-inside: avoid; border: 1px solid #e0e6ef; border-radius: 9px; padding: 12px 14px; }
        h3 { margin: 0 0 8px; color: #263b5c; font-size: 13px; }
        dl { margin: 0; }
        dl > div { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; border-top: 1px solid #edf0f5; }
        dt { color: #58677c; }
        dd { margin: 0; text-align: right; font-weight: 600; }
        .record-divider { border-top: 1px dashed #cbd4e1; margin: 20px 0; }
        .footer { margin-top: 25px; padding-top: 10px; border-top: 1px solid #e0e6ef; color: #738095; font-size: 10px; }
        @media (max-width: 600px) { .groups { grid-template-columns: 1fr; } body { padding: 12px; } }
        @media print { body { max-width: none; } .record-divider { margin: 14px 0; } }
      </style></head>
      <body><main>
        <header class="report-head"><div class="brand">forma · Gym &amp; Health Tracker</div><h1>${escapeHtml(reportTitle)}</h1><div class="subhead">${chosen.length} ${escapeHtml(t("registros seleccionados"))}</div><div class="generated">${escapeHtml(t("Generado el {0}", { 0: generated }))}</div></header>
        ${reportRecords}
        <footer class="footer">forma · Gym &amp; Health Tracker</footer>
      </main></body></html>`;
    const report = window.open("about:blank", "_blank");
    if (!report) {
      setPrintError(true);
      return;
    }
    report.opener = null;
    report.document.open();
    report.document.write(html);
    report.document.close();
    report.document.title = title;
    report.onafterprint = () => setSelected(new Set());
    window.setTimeout(() => {
      report.focus();
      report.print();
    }, 300);
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
          {t("Prepara un informe PDF claro, listo para guardar o imprimir.")}
        </p>
        <p className="muted small export-print-hint">
          {t("Se abrirá la vista de impresión. Elige Guardar como PDF.")}
        </p>
        {printError && (
          <p className="error" role="alert">
            {t(
              "El navegador bloqueó la nueva pestaña. Permite abrirla e inténtalo de nuevo.",
            )}
          </p>
        )}
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
            <FileDown size={17} /> {t("Crear PDF ({0})", { 0: selectedCount })}
          </button>
        </div>
      </div>
    </details>
  );
}
