import { Languages } from "lucide-react";
import {
  languages,
  setLanguage,
  t,
  useLanguage,
  type Language,
} from "../lib/i18n";
export default function LanguageSelector() {
  const language = useLanguage();
  return (
    <label className="language-selector">
      <Languages size={17} aria-hidden="true" />
      <span className="sr-only">{t("Idioma")}</span>
      <select
        aria-label={t("Idioma")}
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code} lang={item.code}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
