import { test, expect } from "@playwright/test";
import { catalogs } from "../src/lib/locales";
import { demoData } from "../src/lib/demo";
import { localDate } from "../src/lib/metrics";
import { buildNutrition, defaultPreferences } from "../src/lib/nutrition";
test("mapa corporal accesible, prioridades persistentes e idiomas en móvil", async ({
  page,
}) => {
  await page.goto("/#nutrition");
  const map = page.getByLabel("Mapa muscular interactivo");
  await expect(map).toBeVisible();
  await map.getByRole("button", { name: "Hombros", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Zona corporal")).toHaveValue("shoulders");
  await page.getByLabel("Quiero desarrollar esta zona").check();
  await page.getByRole("button", { name: "Girar figura" }).click();
  await expect(
    page.getByText("Vista posterior", { exact: true }),
  ).toBeVisible();
  await map
    .getByRole("button", { name: "Glúteos", exact: true })
    .locator("path")
    .first()
    .click();
  await page.getByLabel("Quiero desarrollar esta zona").check();
  await page.getByRole("button", { name: "Guardar objetivo y metas" }).click();
  await expect(page.getByRole("status")).toContainText("guardados");
  await page.reload();
  await page.getByLabel("Zona corporal").selectOption("glutes");
  await expect(page.getByLabel("Quiero desarrollar esta zona")).toBeChecked();
  await page.getByLabel("Zona corporal").selectOption("shoulders");
  await expect(page.getByLabel("Quiero desarrollar esta zona")).toBeChecked();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".body-figure")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const language of ["en", "de", "ru", "pt", "fr"] as const) {
    await page
      .locator(".topbar .language-selector select")
      .selectOption(language);
    await expect(
      page.getByRole("heading", {
        name: catalogs[language]["Explora tu progreso corporal"],
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByLabel(catalogs[language]["Quiero desarrollar esta zona"]),
    ).toBeChecked();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
test("cruza composición y cintura, propone un borrador y no cambia la meta guardada", async ({
  page,
}) => {
  const data = demoData();
  const date = new Date();
  date.setDate(date.getDate() - 35);
  const oldDate = localDate(date),
    today = localDate();
  data.bioimpedance = [
    {
      ...data.bioimpedance[0],
      id: "before",
      date: oldDate,
      weight: 80,
      bodyFat: 20,
      water: 55,
      skeletalMuscle: 40,
      leanMass: 64,
    },
    {
      ...data.bioimpedance[0],
      id: "after",
      date: today,
      weight: 82,
      bodyFat: 22,
      water: 55,
      skeletalMuscle: 40,
      leanMass: 64,
      leftArmKg: 1.1,
      rightArmKg: 1.2,
    },
  ];
  data.measurements = [
    {
      id: "before",
      date: oldDate,
      waist: 80,
      leftArmRelaxed: 30,
      rightArmRelaxed: 31,
    },
    {
      id: "after",
      date: today,
      waist: 82,
      leftArmRelaxed: 30,
      rightArmRelaxed: 31,
    },
  ];
  const preferences = {
    ...defaultPreferences(data.bioimpedance[1]),
    goal: "bulk" as const,
    bodyContext: { priorities: ["arms" as const], comparable: true },
  };
  const nutrition = buildNutrition(
    preferences,
    data.bioimpedance,
    data.measurements,
  );
  await page.addInitScript(
    ({ data, nutrition }) => {
      sessionStorage.setItem("forma-demo-v1", JSON.stringify(data));
      sessionStorage.setItem(
        "forma-demo-nutrition-v1",
        JSON.stringify(nutrition),
      );
    },
    { data, nutrition },
  );
  await page.goto("/#nutrition");
  await expect(page.getByTestId("body-signal")).toContainText(
    "Revisa el superávit",
  );
  await page
    .getByText("Grasa segmentaria del informe", { exact: true })
    .click();
  await expect(page.locator(".body-segments")).toContainText(
    "Estos valores son grasa",
  );
  await expect(page.locator(".body-segments")).toContainText("1,1");
  const before = await page.getByTestId("target-calories").textContent();
  await page
    .getByRole("button", { name: "Previsualizar mantenimiento" })
    .click();
  await expect(page.getByTestId("target-calories")).not.toHaveText(before!);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(sessionStorage.getItem("forma-demo-nutrition-v1")!)
          .preferences.goal,
    ),
  ).toBe("bulk");
  await page.getByRole("button", { name: "Guardar objetivo y metas" }).click();
  await expect(page.getByRole("status")).toContainText("guardados");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(sessionStorage.getItem("forma-demo-nutrition-v1")!)
          .preferences.goal,
    ),
  ).toBe("maintain");
});
test("nutrición guarda metas, usa kg/lb y mantiene traducciones y datos", async ({
  page,
}) => {
  await page.goto("/#nutrition");
  await page.getByLabel("Origen de los datos").selectOption("manual");
  await page.getByLabel("Edad · años", { exact: true }).fill("30");
  await page.getByLabel("Altura · cm", { exact: true }).fill("180");
  await page.getByLabel("Peso corporal · kg", { exact: true }).fill("80");
  await page.getByLabel("Sexo utilizado en la fórmula").selectOption("male");
  await page.getByLabel("Actividad habitual").selectOption("moderate");
  await expect(page.getByTestId("target-calories")).toContainText(/2\s?760/);
  await page.getByRole("button", { name: /Ganar masa muscular/ }).click();
  await expect(page.getByTestId("target-calories")).toContainText(/3\s?030/);
  await page.getByLabel("Unidad del peso").selectOption("lb");
  await expect(page.getByLabel("Peso corporal · lb")).toHaveValue("176.37");
  await expect(page.getByTestId("target-calories")).toContainText(/3\s?030/);
  await page.getByRole("button", { name: "Guardar objetivo y metas" }).click();
  await expect(page.getByRole("status")).toContainText("guardados");
  await page.reload();
  await expect(page.getByLabel("Peso corporal · kg")).toHaveValue("80");
  await expect(page.getByTestId("target-calories")).toContainText(/3\s?030/);
  for (const language of ["en", "de", "ru", "pt", "fr"] as const) {
    await page
      .locator(".topbar .language-selector select")
      .selectOption(language);
    await expect(
      page.getByRole("heading", {
        name: catalogs[language]["Alimenta tu progreso"],
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByTestId("target-protein")).toContainText("144");
  }
  await page.locator(".topbar .language-selector select").selectOption("es");
  await page.getByLabel("Buscar alimento").fill("atun");
  await expect(page.locator(".food-card")).toHaveCount(1);
  await expect(page.locator(".food-card")).toContainText("29");
  await page.getByLabel("Buscar alimento").fill("");
  await page.getByLabel("Filtrar nutriente").selectOption("carbs");
  await expect(page.locator(".food-card")).toHaveCount(2);
  await page.getByRole("link", { name: "Resumen", exact: true }).click();
  await expect(page.locator(".nutrition-summary")).toContainText(/3\s?030/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Ver nutrición" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByLabel("Edad · años", { exact: true }).fill("17");
  await expect(page.getByTestId("target-calories")).toHaveCount(0);
  await expect(page.getByText(/Este cálculo general/)).toBeVisible();
});
test("bioimpedancia recalcula metas guardadas y muestra medidas de contexto", async ({
  page,
}) => {
  await page.goto("/#nutrition");
  await page.getByRole("button", { name: "Guardar objetivo y metas" }).click();
  await expect(page.getByRole("status")).toContainText("guardados");
  const before = await page.getByTestId("target-calories").textContent();
  await page.getByRole("link", { name: "Bioimpedancia", exact: true }).click();
  await page.getByRole("button", { name: "Nueva evaluación" }).click();
  await page.getByLabel("Edad · años *", { exact: true }).fill("30");
  await page.getByLabel("Altura · cm *", { exact: true }).fill("180");
  await page.getByLabel("Peso · kg *", { exact: true }).fill("95");
  await page.getByLabel("Grasa corporal · % *", { exact: true }).fill("20");
  await page.getByLabel("Hora *", { exact: true }).fill("23:59");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await page.getByRole("link", { name: "Nutrición", exact: true }).click();
  await expect(page.getByLabel("Peso corporal · kg")).toHaveValue("95");
  await expect(page.getByTestId("target-calories")).not.toHaveText(before!);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(sessionStorage.getItem("forma-demo-nutrition-v1")!).inputs
            .weight,
      ),
    )
    .toBe(95);
  await page.getByText(/Medidas corporales del/).click();
  await expect(
    page
      .locator("details")
      .filter({ has: page.getByText(/Medidas corporales del/) })
      .locator(".nutrition-measures"),
  ).toContainText("cm");
});
