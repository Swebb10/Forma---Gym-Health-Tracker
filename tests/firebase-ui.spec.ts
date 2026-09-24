import { test, expect } from "@playwright/test";
test("registro, persistencia Firestore, eliminación de campos y aislamiento de cuentas", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Crear una cuenta", exact: true })
    .click();
  const email = "forma-" + Date.now() + "@example.com";
  await page.getByLabel("Correo electrónico").fill(email);
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Test-1234-password");
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Un poco más fuerte/ }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Medidas corporales", exact: true })
    .click();
  await page.getByRole("button", { name: "Añadir medidas" }).click();
  await page.getByLabel("Cintura · cm", { exact: true }).fill("83");
  await page.getByLabel("Pecho · cm", { exact: true }).fill("101");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: /Editar medidas/ }).click();
  await page.getByLabel("Pecho · cm", { exact: true }).fill("");
  await page.getByLabel("Cintura · cm", { exact: true }).fill("82");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "82", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "101", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /Editar medidas/ }).click();
  await expect(page.getByLabel("Pecho · cm", { exact: true })).toHaveValue("");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.getByRole("link", { name: "Mis rutinas", exact: true }).click();
  await page.getByRole("button", { name: "Nueva rutina", exact: true }).click();
  await page.getByLabel("Nombre de la rutina").fill("Rutina original");
  await page.getByLabel("Nombre del ejercicio").fill("Press de banca");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Entrenar", exact: true }).click();
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Editar Rutina original" }).click();
  await page.getByLabel("Nombre de la rutina").fill("Rutina editada");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(
    page.getByRole("heading", { name: "Rutina editada" }),
  ).toBeVisible();
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Eliminar registro" }).click();
  await expect(
    page.getByRole("heading", { name: "Todo empieza con un plan" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Entrenamientos", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Rutina original" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page
    .getByRole("button", { name: "Crear una cuenta", exact: true })
    .click();
  await page
    .getByLabel("Correo electrónico")
    .fill("other-" + Date.now() + "@example.com");
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Test-1234-password");
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Sin entrenamientos en este período" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.getByLabel("Correo electrónico").fill(email);
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Test-1234-password");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Rutina original" }),
  ).toBeVisible();
});
