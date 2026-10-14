import { themeCatalogs } from "./themes";
import { coherenceCatalogs } from "./coherence";
import { trainingCatalogs } from "./trainingProgress";
import { bodyCatalogs } from "./bodyAnalysis";
import { nutritionCatalogs } from "./nutrition";
import en from "./en";
import de from "./de";
import ru from "./ru";
import pt from "./pt";
import fr from "./fr";
export const catalogs = {
  en: {
    ...en,
    ...nutritionCatalogs.en,
    ...bodyCatalogs.en,
    ...trainingCatalogs.en,
    ...coherenceCatalogs.en,
    ...themeCatalogs.en,
  },
  de: {
    ...de,
    ...nutritionCatalogs.de,
    ...bodyCatalogs.de,
    ...trainingCatalogs.de,
    ...coherenceCatalogs.de,
    ...themeCatalogs.de,
  },
  ru: {
    ...ru,
    ...nutritionCatalogs.ru,
    ...bodyCatalogs.ru,
    ...trainingCatalogs.ru,
    ...coherenceCatalogs.ru,
    ...themeCatalogs.ru,
  },
  pt: {
    ...pt,
    ...nutritionCatalogs.pt,
    ...bodyCatalogs.pt,
    ...trainingCatalogs.pt,
    ...coherenceCatalogs.pt,
    ...themeCatalogs.pt,
  },
  fr: {
    ...fr,
    ...nutritionCatalogs.fr,
    ...bodyCatalogs.fr,
    ...trainingCatalogs.fr,
    ...coherenceCatalogs.fr,
    ...themeCatalogs.fr,
  },
};
