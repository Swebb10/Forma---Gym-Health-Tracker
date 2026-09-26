import { test, expect } from "@playwright/test";
test("planes de demostración, diseño móvil y temas sin permitir pagos", async ({
  page,
}) => {
  await page.goto("/#subscription");
  await expect(
    page.getByRole("heading", { name: "Mi suscripción", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /3 meses.*14/ }).click();
  await expect(
    page.getByRole("button", { name: "Pago deshabilitado en demo" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "Enviar comprobante" }),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path:
      (process.env.FORMA_SCREENSHOTS ?? "test-results") +
      "/suscripcion-escritorio.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page
        .locator(".sidebar")
        .evaluate((el) => el.getBoundingClientRect().right),
    )
    .toBeLessThanOrEqual(0);
  await page.getByRole("button", { name: "Activar tema oscuro" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path:
      (process.env.FORMA_SCREENSHOTS ?? "test-results") +
      "/suscripcion-movil-oscura.png",
    fullPage: true,
    animations: "disabled",
  });
});
