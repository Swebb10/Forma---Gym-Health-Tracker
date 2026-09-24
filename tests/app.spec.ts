import { test, expect } from "@playwright/test";
test("rutina, sesión, medidas y bioimpedancia persisten en la demo", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Un poco más fuerte/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Mis rutinas", exact: true }).click();
  await page.getByRole("button", { name: "Nueva rutina", exact: true }).click();
  await page.getByLabel("Nombre de la rutina").fill("Rutina de prueba");
  await page.getByLabel("Nombre del ejercicio").fill("Sentadilla de prueba");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  const card = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: "Rutina de prueba" }) });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Entrenar", exact: true }).click();
  await page
    .getByLabel("Peso ejercicio 1 serie 1", { exact: true })
    .fill("42.5");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await page.getByRole("link", { name: "Entrenamientos", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Rutina de prueba" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Rutina de prueba" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Medidas corporales", exact: true })
    .click();
  await page.getByRole("button", { name: "Añadir medidas" }).click();
  await page.getByLabel("Cintura · cm", { exact: true }).fill("81.5");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(
    page.getByRole("cell", { name: "81,5", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Bioimpedancia", exact: true }).click();
  await page.getByRole("button", { name: "Nueva evaluación" }).click();
  await page.getByLabel("Edad · años *", { exact: true }).fill("30");
  await page.getByLabel("Altura · cm *", { exact: true }).fill("180");
  await page.getByLabel("Peso · kg *", { exact: true }).fill("81");
  await page.getByLabel("Grasa corporal · % *", { exact: true }).fill("20");
  await page
    .getByLabel("Brazo izquierdo · ESI · kg", { exact: true })
    .fill("1.2");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  const newest = page.locator(".bio-card").first();
  await expect(newest).toContainText("25");
  await newest.locator("summary").click();
  await expect(newest).toContainText("1,2");
  await newest.getByRole("button", { name: /Editar evaluación/ }).click();
  await expect(
    page.getByLabel("Brazo izquierdo · ESI · kg", { exact: true }),
  ).toHaveValue("1.2");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  page.on("dialog", (d) => d.accept());
  await newest.getByRole("button", { name: "Eliminar registro" }).click();
  await expect(page.locator(".bio-card")).toHaveCount(6);
});
test("tema persistente, navegación móvil y ausencia de desbordamiento", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Un poco más fuerte/ }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  const theme = page.getByRole("button", { name: "Activar tema oscuro" });
  if (await theme.isVisible()) await theme.click();
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("link", { name: "Bioimpedancia", exact: true }).click();
  await page.getByRole("button", { name: "Nueva evaluación" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const d = document.querySelector("dialog")!;
        return d.scrollWidth <= d.clientWidth;
      }),
    )
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
