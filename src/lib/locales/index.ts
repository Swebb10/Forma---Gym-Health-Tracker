import { nutritionCatalogs } from "./nutrition";
import en from "./en";
import de from "./de";
import ru from "./ru";
import pt from "./pt";
import fr from "./fr";
export const catalogs = {
  en: { ...en, ...nutritionCatalogs.en },
  de: { ...de, ...nutritionCatalogs.de },
  ru: { ...ru, ...nutritionCatalogs.ru },
  pt: { ...pt, ...nutritionCatalogs.pt },
  fr: { ...fr, ...nutritionCatalogs.fr },
};
