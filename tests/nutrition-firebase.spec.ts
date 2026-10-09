import { test, expect } from "@playwright/test";
test("perfil nutricional persiste en Firestore, se recalcula y permanece aislado", async ({
  page,
  browser,
}) => {
  const email = "nutrition-" + Date.now() + "@example.com",
    password = "Test-1234-password";
  await page.goto("/");
  await page
    .getByRole("button", { name: "Crear una cuenta", exact: true })
    .click();
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await page.getByRole("link", { name: "Nutrición", exact: true }).click();
  await page.getByLabel("Edad · años", { exact: true }).fill("30");
  await page.getByLabel("Altura · cm", { exact: true }).fill("180");
  await page.getByLabel("Peso corporal · kg").fill("80");
  await page.getByLabel("Sexo utilizado en la fórmula").selectOption("male");
  await page.getByLabel("Actividad habitual").selectOption("moderate");
  await page.getByLabel("Quiero desarrollar esta zona").check();
  await page.getByLabel(/Mis registros usan el mismo equipo/).check();
  await page.getByRole("button", { name: "Guardar objetivo y metas" }).click();
  await expect(page.getByRole("status")).toContainText("guardados");
  const context = await browser.newContext();
  const second = await context.newPage();
  await second.goto("/");
  await second.getByLabel("Correo electrónico").fill(email);
  await second.getByLabel("Contraseña", { exact: true }).fill(password);
  await second
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await second.getByRole("link", { name: "Nutrición", exact: true }).click();
  await expect(second.getByLabel("Peso corporal · kg")).toHaveValue("80");
  await expect(second.getByLabel("Quiero desarrollar esta zona")).toBeChecked();
  await expect(
    second.getByLabel(/Mis registros usan el mismo equipo/),
  ).toBeChecked();
  await page.getByRole("link", { name: "Bioimpedancia", exact: true }).click();
  await page.getByRole("button", { name: "Nueva evaluación" }).click();
  await page.getByLabel("Edad · años *", { exact: true }).fill("31");
  await page.getByLabel("Altura · cm *", { exact: true }).fill("180");
  await page.getByLabel("Peso · kg *", { exact: true }).fill("90");
  await page.getByLabel("Grasa corporal · % *", { exact: true }).fill("20");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("link", { name: "Nutrición", exact: true }).click();
  await page.getByLabel("Origen de los datos").selectOption("bio");
  await page.getByRole("button", { name: "Guardar objetivo y metas" }).click();
  await expect(page.getByRole("status")).toContainText("guardados");
  await second.reload();
  await expect(second.getByLabel("Peso corporal · kg")).toHaveValue("90");
  await page.getByRole("link", { name: "Bioimpedancia", exact: true }).click();
  await page.getByRole("button", { name: /Editar evaluación/ }).click();
  await page.getByLabel("Peso · kg *", { exact: true }).fill("95");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(second.getByLabel("Peso corporal · kg")).toHaveValue("95");
  await second.reload();
  await expect(second.getByLabel("Peso corporal · kg")).toHaveValue("95");
  await context.close();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page
    .getByRole("button", { name: "Crear una cuenta", exact: true })
    .click();
  await page.getByLabel("Correo electrónico").fill("other-" + email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await page.getByRole("link", { name: "Nutrición", exact: true }).click();
  await expect(page.getByLabel("Peso corporal · kg")).toHaveValue("");
  await expect(page.getByTestId("target-calories")).toHaveCount(0);
  await expect(
    page.getByLabel("Quiero desarrollar esta zona"),
  ).not.toBeChecked();
});
