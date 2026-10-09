import { useState } from "react";
import { Search, ExternalLink } from "lucide-react";
import { t, useLanguage } from "../../lib/i18n";
import { numberLabel } from "../../lib/metrics";
import { foods, nutrientLabels } from "../../lib/foods";
export default function FoodGuide() {
  useLanguage();
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all");
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  const visible = foods.filter(
    (f) =>
      (filter === "all" || filter === f.nutrient) &&
      normalize(t(f.name)).includes(normalize(search)),
  );
  return (
    <section className="panel nutrition-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t("DEL NÚMERO AL PLATO")}</span>
          <h2>{t("Macro-Guía")}</h2>
          <p className="muted">
            {t("Porciones de referencia, sin complicaciones.")}
          </p>
        </div>
      </div>
      <div className="food-filters">
        <label className="food-search">
          <Search size={18} />
          <input
            type="search"
            aria-label={t("Buscar alimento")}
            placeholder={t("Buscar alimento")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label={t("Filtrar nutriente")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">{t("Todos")}</option>
          {Object.entries(nutrientLabels).map(([id, label]) => (
            <option key={id} value={id}>
              {t(label)}
            </option>
          ))}
        </select>
      </div>
      <div className="food-grid">
        {visible.map((food) => (
          <article className="food-card" key={food.id}>
            <span className={"tag food-" + food.nutrient}>
              {t(nutrientLabels[food.nutrient])}
            </span>
            <h3>{t(food.name)}</h3>
            <p className="small muted">{t(food.portion)}</p>
            <strong>≈ {numberLabel(food.grams)} g</strong>
            <a
              className="small"
              href={food.source}
              target="_blank"
              rel="noreferrer"
            >
              USDA <ExternalLink size={12} />
            </a>
          </article>
        ))}
      </div>
      {!visible.length && (
        <p className="muted">{t("No hay alimentos que coincidan.")}</p>
      )}
      <p className="small muted">
        {t(
          "Se destaca un nutriente, no la composición completa. Las marcas, el tamaño y la preparación cambian los valores. En un huevo revuelto cuenta también el aceite, la mantequilla o la leche; en el atún usa el peso escurrido y la etiqueta de tu lata.",
        )}
      </p>
    </section>
  );
}
