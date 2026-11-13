import { themeCatalogs } from "./themes";
import { exportCatalogs } from "./exports";
import { nextSessionCatalogs } from "./nextSession";
import { mealLogCatalogs } from "./mealLog";
import { exerciseDetailsCatalogs } from "./exerciseDetails";
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
    ...exportCatalogs.en,
    ...nextSessionCatalogs.en,
    ...mealLogCatalogs.en,
    ...exerciseDetailsCatalogs.en,
  },
  de: {
    ...de,
    ...nutritionCatalogs.de,
    ...bodyCatalogs.de,
    ...trainingCatalogs.de,
    ...coherenceCatalogs.de,
    ...themeCatalogs.de,
    ...exportCatalogs.de,
    ...nextSessionCatalogs.de,
    ...mealLogCatalogs.de,
    ...exerciseDetailsCatalogs.de,
  },
  ru: {
    ...ru,
    ...nutritionCatalogs.ru,
    ...bodyCatalogs.ru,
    ...trainingCatalogs.ru,
    ...coherenceCatalogs.ru,
    ...themeCatalogs.ru,
    ...exportCatalogs.ru,
    ...nextSessionCatalogs.ru,
    ...mealLogCatalogs.ru,
    ...exerciseDetailsCatalogs.ru,
  },
  pt: {
    ...pt,
    ...nutritionCatalogs.pt,
    ...bodyCatalogs.pt,
    ...trainingCatalogs.pt,
    ...coherenceCatalogs.pt,
    ...themeCatalogs.pt,
    ...exportCatalogs.pt,
    ...nextSessionCatalogs.pt,
    ...mealLogCatalogs.pt,
    ...exerciseDetailsCatalogs.pt,
  },
  fr: {
    ...fr,
    ...nutritionCatalogs.fr,
    ...bodyCatalogs.fr,
    ...trainingCatalogs.fr,
    ...coherenceCatalogs.fr,
    ...themeCatalogs.fr,
    ...exportCatalogs.fr,
    ...nextSessionCatalogs.fr,
    ...mealLogCatalogs.fr,
    ...exerciseDetailsCatalogs.fr,
  },
};
