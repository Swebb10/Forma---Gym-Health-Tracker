import { test, expect } from "@playwright/test";
test("perfil, peso y metas persisten en Firestore y se sincronizan entre cuentas aisladas", async ({
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
  await page.getByRole("link", { name: "Mi cuerpo", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirmar datos personales" })
    .click();
  await page.getByLabel("Edad · años", { exact: true }).fill("30");
  await page.getByLabel("Altura · cm", { exact: true }).fill("180");
  await page.getByLabel("Sexo utilizado en la fórmula").selectOption("male");
  await page.getByRole("button", { name: "Guardar datos personales" }).click();
  await expect(
    page.getByRole("button", { name: "Actualizar datos personales" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Registrar peso", exact: true })
    .click();
  await page.getByLabel("Hora", { exact: true }).fill("00:01");
  await page.getByLabel("Peso corporal · kg").fill("80");
  await page.getByRole("button", { name: "Guardar peso", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Registrar peso", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Quiero desarrollar esta zona").check();
  await page.getByLabel(/Mis registros usan el mismo equipo/).check();
  await page.getByRole("button", { name: "Guardar contexto corporal" }).click();
  await expect(
    page.getByRole("button", { name: "Guardar contexto corporal" }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Nutrición", exact: true }).click();
  await page.getByLabel("Actividad habitual").selectOption("moderate");
  await page.getByRole("button", { name: "Guardar objetivo y metas" }).click();
  await expect(page.getByRole("status")).toContainText("guardados");
  const context = await browser.newContext(),
    second = await context.newPage();
  await second.goto("/");
  await second.getByLabel("Correo electrónico").fill(email);
  await second.getByLabel("Contraseña", { exact: true }).fill(password);
  await second
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await second.getByRole("link", { name: "Mi cuerpo", exact: true }).click();
  await expect(second.locator(".body-current-weight")).toContainText("80 kg");
  await expect(second.getByLabel("Quiero desarrollar esta zona")).toBeChecked();
  await expect(
    second.getByLabel(/Mis registros usan el mismo equipo/),
  ).toBeChecked();
  await second.getByRole("link", { name: "Nutrición", exact: true }).click();
  await expect(second.getByTestId("target-calories")).toContainText(/2\s?760/);
  await page.getByRole("link", { name: "Mi cuerpo", exact: true }).click();
  await page
    .getByRole("button", { name: "Bioimpedancia", exact: true })
    .click();
  await page.getByRole("button", { name: "Nueva evaluación" }).click();
  await page.getByLabel("Edad · años *", { exact: true }).fill("31");
  await page.getByLabel("Altura · cm *", { exact: true }).fill("180");
  await page.getByLabel("Peso · kg *", { exact: true }).fill("90");
  await page.getByLabel("Grasa corporal · % *", { exact: true }).fill("20");
  await page.getByLabel("Hora *", { exact: true }).fill("23:59");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(second.locator(".nutrition-context")).toContainText("90 kg");
  await page.getByRole("button", { name: /Editar evaluación/ }).click();
  await page.getByLabel("Peso · kg *", { exact: true }).fill("95");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(second.locator(".nutrition-context")).toContainText("95 kg");
  await second.reload();
  await expect(second.locator(".nutrition-context")).toContainText("95 kg");
  await context.close();
  // A local workout draft belongs to this UID and must not appear for another account.
  await page.getByRole("link", { name: "Entrenamientos", exact: true }).click();
  await page
    .getByRole("button", { name: "Registrar sesión", exact: true })
    .click();
  await page
    .getByLabel("Nombre de la sesión", { exact: true })
    .fill("Borrador privado");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page
    .getByRole("button", { name: "Crear una cuenta", exact: true })
    .click();
  await page.getByLabel("Correo electrónico").fill("other-" + email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Retomar borrador" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Mi cuerpo", exact: true }).click();
  await expect(page.locator(".body-current-weight")).toContainText("—");
  await expect(
    page.getByLabel("Quiero desarrollar esta zona"),
  ).not.toBeChecked();
  await page.getByRole("link", { name: "Nutrición", exact: true }).click();
  await expect(page.getByTestId("target-calories")).toHaveCount(0);
});
