import { test, expect } from "@playwright/test";
import { catalogs } from "../src/lib/locales";
test("seis idiomas, borrador intacto y valores almacenados estables", async ({
  page,
}) => {
  await page.goto("/#routines");
  await page.getByRole("button", { name: "Nueva rutina", exact: true }).click();
  await page.getByLabel("Nombre de la rutina").fill("Mi rutina personal");
  await page.getByLabel("Nombre del ejercicio").fill("Mi ejercicio personal");
  await page.getByLabel("Día de la semana").selectOption("Lunes");
  await page.getByLabel("Grupo muscular").selectOption("Tríceps");
  const dialog = page.getByRole("dialog");
  for (const language of ["en", "de", "ru", "pt", "fr", "es"] as const) {
    const tr = (s: string) =>
      language === "es" ? s : (catalogs[language][s] ?? s);
    await dialog.locator(".language-selector select").selectOption(language);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(dialog.getByLabel(tr("Nombre de la rutina"))).toHaveValue(
      "Mi rutina personal",
    );
    await expect(dialog.getByLabel(tr("Grupo muscular"))).toHaveValue(
      "Tríceps",
    );
    await expect(dialog.getByLabel(tr("Día de la semana"))).toHaveValue(
      "Lunes",
    );
    await expect(
      dialog.getByRole("button", { name: tr("Guardar registro") }),
    ).toBeVisible();
  }
  await dialog.locator(".language-selector select").selectOption("en");
  await dialog
    .getByRole("button", { name: "Save record", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Mi rutina personal", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { name: "Mi rutina personal", exact: true }),
  ).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("forma-demo-v1")!),
  );
  const routine = stored.routines.find(
    (r: { name: string }) => r.name === "Mi rutina personal",
  );
  expect(routine.days[0].weekday).toBe("Lunes");
  expect(routine.days[0].exercises[0].group).toBe("Tríceps");
});
test("navegación, formularios y acceso traducidos sin desbordamiento móvil", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const language of ["en", "de", "ru", "pt", "fr"] as const) {
    const tr = (s: string) => catalogs[language][s] ?? s;
    await page
      .locator(".topbar .language-selector select")
      .selectOption(language);
    for (const [route, title, action] of [
      ["measurements", "Más allá de la báscula", "Añadir medidas"],
      ["bioimpedance", "Conoce tu composición", "Nueva evaluación"],
      ["subscription", "Mi suscripción", ""],
    ]) {
      await page
        .getByRole("button", { name: tr("Abrir menú"), exact: true })
        .click();
      await page.locator(`nav a[href="#${route}"]`).click();
      await expect(page.locator("main")).toBeVisible();
      if (action) {
        await page
          .getByRole("button", { name: tr(action), exact: true })
          .click();
        await expect(page.getByRole("dialog")).toBeVisible();
        expect(
          await page
            .getByRole("dialog")
            .evaluate((d) => d.scrollWidth <= d.clientWidth),
        ).toBe(true);
        await page.keyboard.press("Escape");
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.getByRole("button", { name: catalogs.fr["Abrir menú"] }).click();
  await page
    .getByRole("button", { name: catalogs.fr["Salir de demostración"] })
    .click();
  await expect(page.locator(".auth-language select")).toHaveValue("fr");
  await page.locator(".auth-language select").selectOption("de");
  await expect(
    page.getByRole("heading", { name: catalogs.de["Qué bueno verte"] }),
  ).toBeVisible();
});
