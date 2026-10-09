import { test, expect } from "@playwright/test";
import { catalogs } from "../src/lib/locales";
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
  await expect(page.locator(".nutrition-measures")).toContainText("cm");
});
