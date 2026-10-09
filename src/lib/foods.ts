export const nutrientLabels = {
  protein: "Proteínas",
  carbs: "Carbohidratos",
  fat: "Grasas",
} as const;
export const foods = [
  {
    id: "egg",
    name: "Huevo grande",
    portion: "1 unidad · unos 50 g, sin aceite añadido",
    nutrient: "protein",
    grams: 6.3,
    source:
      "https://www.nal.usda.gov/sites/default/files/page-files/Protein.pdf",
  },
  {
    id: "tuna",
    name: "Atún en aceite, escurrido",
    portion: "100 g escurridos · revisa el peso real de tu lata",
    nutrient: "protein",
    grams: 29,
    source: "https://fdc.nal.usda.gov/food-details/173708/nutrients",
  },
  {
    id: "chicken",
    name: "Pechuga de pollo cocida",
    portion: "100 g · sin piel, asada",
    nutrient: "protein",
    grams: 31,
    source: "https://fdc.nal.usda.gov/food-details/171477/nutrients",
  },
  {
    id: "rice",
    name: "Arroz blanco cocido",
    portion: "1 taza · unos 158 g",
    nutrient: "carbs",
    grams: 45,
    source:
      "https://www.nal.usda.gov/sites/default/files/page-files/Carbohydrate.pdf",
  },
  {
    id: "beans",
    name: "Frijoles negros cocidos",
    portion: "½ taza · sin grasa añadida",
    nutrient: "carbs",
    grams: 22.5,
    source:
      "https://www.nal.usda.gov/sites/default/files/page-files/Carbohydrate.pdf",
  },
  {
    id: "oil",
    name: "Aceite de oliva",
    portion: "1 cucharada · unos 14 g",
    nutrient: "fat",
    grams: 14,
    source: "https://fdc.nal.usda.gov/food-details/171413/nutrients",
  },
] as const;
