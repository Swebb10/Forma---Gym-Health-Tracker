import { catalogs } from "../src/lib/locales";
import { test, expect, type Page } from "@playwright/test";
const screenshots = process.env.FORMA_SCREENSHOTS ?? "test-results";
const password = "Test-1234-password";
async function login(page: Page, email: string) {
  await page.goto("/");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
}
test("suscripciones, verificación de dueño, pagos, cambios de modo y suspensión", async ({
  page,
  browser,
  request,
}) => {
  test.setTimeout(120000);
  const email = "subscriber-" + Date.now() + "@example.com";
  const authURL =
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:";
  const create = await request.post(authURL + "signUp?key=demo-api-key", {
    data: { email, password, returnSecureToken: true },
  });
  expect(create.ok()).toBeTruthy();
  const customer = await create.json();
  const ownerCreate = await request.post(authURL + "signUp?key=demo-api-key", {
    data: { email: "swebb1732@gmail.com", password, returnSecureToken: true },
  });
  expect(ownerCreate.ok()).toBeTruthy();
  const owner = await ownerCreate.json();
  await login(page, email);
  await page.getByRole("link", { name: "Mi suscripción", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mi suscripción", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Prueba gratuita", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cambiar de modo" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /3 meses.*14/ }).click();
  await expect(
    page.getByRole("link", { name: "Enviar comprobante" }),
  ).toHaveAttribute("href", /wa.me\/50687273417/);
  await expect(
    page.getByRole("link", { name: "Enviar comprobante" }),
  ).toHaveAttribute("href", /quarterly|3%20meses/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page
        .locator(".sidebar")
        .evaluate((el) => el.getBoundingClientRect().right),
    )
    .toBeLessThanOrEqual(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: screenshots + "/suscripcion-movil.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 1440, height: 1050 });
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
  });
  const admin = await adminContext.newPage();
  await login(admin, "swebb1732@gmail.com");
  await expect(
    admin.getByText("Activa tu acceso de súper administrador"),
  ).toBeVisible();
  await expect(
    admin.getByRole("button", { name: "Cambiar de modo" }),
  ).toHaveCount(0);
  // Only the local emulator accepts this privileged test-only token.
  const verified = await request.post(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/demo-forma/accounts:update",
    {
      headers: { Authorization: "Bearer owner" },
      data: { localId: owner.localId, emailVerified: true },
    },
  );
  expect(verified.ok()).toBeTruthy();
  await admin.getByRole("button", { name: "Ya verifiqué mi correo" }).click();
  await expect(
    admin.getByRole("dialog", { name: "¿Cómo quieres entrar?" }),
  ).toBeVisible();
  await admin.evaluate(() => window.scrollTo(0, 0));
  await admin.screenshot({
    path: screenshots + "/elegir-modo.png",
    fullPage: true,
    animations: "disabled",
  });
  await admin
    .getByRole("button", { name: "Entrar como administrador" })
    .click();
  await expect(
    admin.getByRole("heading", { name: "Administración", exact: true }),
  ).toBeVisible();
  for (const language of ["en", "de", "ru", "pt", "fr"] as const) {
    await admin
      .locator(".topbar .language-selector select")
      .selectOption(language);
    await expect(
      admin.getByRole("heading", {
        name: catalogs[language]["Administración"],
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      admin.getByRole("button", {
        name: catalogs[language]["Configuración"],
        exact: true,
      }),
    ).toBeVisible();
  }
  await admin.locator(".topbar .language-selector select").selectOption("es");
  await admin.getByLabel("Buscar cuenta").fill(email);
  const card = admin.locator(".member-card").filter({ hasText: email });
  await card.getByRole("button", { name: "Registrar SINPE" }).click();
  await admin.getByLabel("Plan pagado").selectOption("quarterly");
  await admin.getByLabel("Referencia SINPE").fill("SINPE-QA-12345");
  await admin.getByLabel(/Verifiqué en mi banco/).check();
  await admin.getByRole("button", { name: "Confirmar pago y renovar" }).click();
  await expect(admin.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Activa", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Referencia SINPE: SINPE-QA-12345", { exact: true }),
  ).toBeVisible();
  await card.getByRole("button", { name: "Registrar SINPE" }).click();
  await admin.getByLabel("Referencia SINPE").fill("sinpe-qa-12345");
  await admin.getByLabel(/Verifiqué en mi banco/).check();
  await admin.getByRole("button", { name: "Confirmar pago y renovar" }).click();
  await expect(admin.getByRole("alert")).toContainText("ya fue registrada");
  await admin.getByRole("button", { name: "Cancelar", exact: true }).click();
  await card.getByRole("button", { name: "Suspender", exact: true }).click();
  await admin
    .getByLabel("Motivo", { exact: true })
    .fill("Suspensión de prueba");
  await admin.getByRole("button", { name: "Confirmar suspensión" }).click();
  await expect(admin.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Tu cuenta está suspendida" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Enviar comprobante" }),
  ).toHaveCount(0);
  await card.getByRole("button", { name: "Reactivar", exact: true }).click();
  await admin
    .getByLabel("Motivo", { exact: true })
    .fill("Reactivación de prueba");
  await admin
    .getByRole("button", { name: "Reactivar cuenta", exact: true })
    .click();
  await expect(admin.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Activa", { exact: true })).toBeVisible();
  await card.getByRole("button", { name: "Editar suscripción" }).click();
  await admin.getByLabel("Ajustar manualmente el vencimiento").check();
  await admin.getByLabel("Acceso hasta (inclusive)").fill("2020-01-01");
  await admin.getByLabel("Motivo del cambio").fill("Verificar vencimiento");
  await admin.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(admin.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Vencida", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Mis rutinas", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mi suscripción", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Nueva rutina", exact: true }),
  ).toHaveCount(0);
  // Two simultaneous confirmations with the same bank reference cannot double-renew.
  const results = await admin.evaluate(
    async ({ memberId }) => {
      const path = "/src/services/subscriptions.ts";
      const service = await import(path);
      const jobs = await Promise.allSettled([
        service.registerPayment(
          memberId,
          "monthly",
          "CONCURRENT-QA-1",
          service.newPaymentId(),
          5000,
        ),
        service.registerPayment(
          memberId,
          "monthly",
          "concurrent-qa-1",
          service.newPaymentId(),
          5000,
        ),
      ]);
      return jobs.map((j) => j.status);
    },
    { memberId: customer.localId },
  );
  expect(results.sort()).toEqual(["fulfilled", "rejected"]);
  await page.getByRole("link", { name: "Mi suscripción", exact: true }).click();
  await expect(page.getByText("Activa", { exact: true })).toBeVisible();
  await admin
    .getByRole("button", { name: "Configuración", exact: true })
    .click();
  await admin.getByLabel("1 mes · CRC", { exact: true }).fill("5500");
  await admin.getByRole("button", { name: "Guardar configuración" }).click();
  await expect(admin.getByRole("status")).toContainText(
    "Configuración guardada",
  );
  await expect(page.locator(".plan-price").first()).toContainText("5");
  await expect
    .poll(() => page.locator(".plan-price").first().innerText())
    .toMatch(/5[.,\s]?500/);
  await admin.getByLabel("1 mes · CRC", { exact: true }).fill("5000");
  await admin.getByRole("button", { name: "Guardar configuración" }).click();
  await admin
    .getByRole("button", { name: "Suscripciones", exact: true })
    .click();
  await admin.getByLabel("Buscar cuenta").fill("");
  await admin.evaluate(() => window.scrollTo(0, 0));
  await admin.screenshot({
    path: screenshots + "/administracion.png",
    fullPage: true,
    animations: "disabled",
  });
  await admin.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      admin.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await expect
    .poll(() =>
      admin
        .locator(".sidebar")
        .evaluate((el) => el.getBoundingClientRect().right),
    )
    .toBeLessThanOrEqual(0);
  await admin.evaluate(() => window.scrollTo(0, 0));
  await admin.screenshot({
    path: screenshots + "/administracion-movil.png",
    fullPage: true,
    animations: "disabled",
  });
  await admin.setViewportSize({ width: 1440, height: 1050 });
  await admin.getByRole("button", { name: "Cambiar de modo" }).click();
  await admin.getByRole("button", { name: "Entrar como usuario" }).click();
  await admin
    .getByRole("link", { name: "Medidas corporales", exact: true })
    .click();
  await admin.getByRole("button", { name: "Añadir medidas" }).click();
  await admin
    .getByLabel("Cintura (A la altura del ombligo) · cm", { exact: true })
    .fill("81");
  await admin.getByRole("button", { name: "Guardar registro" }).click();
  await expect(admin.getByRole("dialog")).toHaveCount(0);
  await admin.getByRole("button", { name: "Cambiar de modo" }).click();
  await admin
    .getByRole("button", { name: "Entrar como administrador" })
    .click();
  await expect(
    admin.getByRole("heading", { name: "Administración", exact: true }),
  ).toBeVisible();
  await admin.reload();
  await expect(
    admin.getByRole("dialog", { name: "¿Cómo quieres entrar?" }),
  ).toBeVisible();
  await admin.getByRole("button", { name: "Entrar como usuario" }).click();
  await admin
    .getByRole("link", { name: "Medidas corporales", exact: true })
    .click();
  await expect(
    admin.getByRole("cell", { name: "81", exact: true }),
  ).toBeVisible();
  await adminContext.close();
});
