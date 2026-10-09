import { bodyCatalogs } from "./bodyAnalysis";
import { nutritionCatalogs } from "./nutrition";
import en from "./en";
import de from "./de";
import ru from "./ru";
import pt from "./pt";
import fr from "./fr";
export const catalogs = {
  en: { ...en, ...nutritionCatalogs.en, ...bodyCatalogs.en },
  de: { ...de, ...nutritionCatalogs.de, ...bodyCatalogs.de },
  ru: { ...ru, ...nutritionCatalogs.ru, ...bodyCatalogs.ru },
  pt: { ...pt, ...nutritionCatalogs.pt, ...bodyCatalogs.pt },
  fr: { ...fr, ...nutritionCatalogs.fr, ...bodyCatalogs.fr },
};
