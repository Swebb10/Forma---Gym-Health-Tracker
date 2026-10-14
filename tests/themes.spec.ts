import { test, expect } from "@playwright/test";
import { themes } from "../src/lib/theme";

function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const values = hex
      .trim()
      .slice(1)
      .match(/../g)!
      .map((v) => {
        const c = parseInt(v, 16) / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
  };
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

test("los seis temas conservan contraste, se aplican y persisten", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Un poco más fuerte/ }),
  ).toBeVisible();
  for (const theme of themes) {
    await page.getByRole("button", { name: "Elegir tema" }).click();
    await expect(page.getByRole("radio")).toHaveCount(6);
    await page.getByRole("radio", { name: theme.name, exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme.id);
    await expect(
      page.getByRole("radio", { name: theme.name, exact: true }),
    ).toBeChecked();
    await page.getByRole("button", { name: "Listo", exact: true }).click();
    const colors = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return Object.fromEntries(
        [
          "text",
          "muted",
          "bg",
          "panel",
          "blue",
          "blue-soft",
          "hover",
          "primary-bg",
          "primary-hover",
          "on-primary",
          "chart-secondary",
          "feature-bg",
          "feature-text",
          "feature-muted",
          "danger",
          "success",
        ].map((key) => [key, style.getPropertyValue(`--${key}`).trim()]),
      );
    });
    const textPairs = [
      ["text", "bg"],
      ["text", "panel"],
      ["muted", "bg"],
      ["muted", "panel"],
      ["muted", "blue-soft"],
      ["blue", "blue-soft"],
      ["blue", "panel"],
      ["text", "hover"],
      ["on-primary", "primary-bg"],
      ["on-primary", "primary-hover"],
      ["feature-text", "feature-bg"],
      ["feature-muted", "feature-bg"],
      ["danger", "panel"],
      ["success", "panel"],
      ["chart-secondary", "panel"],
    ];
    for (const [foreground, background] of textPairs) {
      expect(
        contrast(colors[foreground], colors[background]),
        `${theme.id}: ${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
    await page.mouse.move(0, 0);
    await page.screenshot({
      path: `test-results/themes/${theme.id}.png`,
      animations: "disabled",
    });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme.id);
    expect(await page.evaluate(() => localStorage.getItem("forma-theme"))).toBe(
      theme.id,
    );
    expect(
      await page
        .locator("html")
        .evaluate((el) => el.classList.contains("dark")),
    ).toBe(theme.dark);
    expect(
      await page
        .locator("html")
        .evaluate((el) => getComputedStyle(el).colorScheme),
    ).toBe(theme.dark ? "dark" : "light");
  }
});

test("selector accesible en móvil, teclado e idiomas", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Elegir tema" });
  await trigger.click();
  await page.getByRole("radio", { name: "Cyberpunk", exact: true }).check();
  await page.getByRole("radio", { name: "Cyberpunk", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: "Ónix", exact: true }),
  ).toBeChecked();
  await page.getByRole("radio", { name: "Resplandor", exact: true }).check();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const dialog = document.querySelector("dialog")!;
        return (
          dialog.scrollWidth <= dialog.clientWidth &&
          document.documentElement.scrollWidth <= innerWidth
        );
      }),
    )
    .toBe(true);
  await page
    .getByRole("button", { name: "Listo", exact: true })
    .scrollIntoViewIfNeeded();
  await page.locator(".theme-option").last().scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/themes/selector-mobile.png" });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.screenshot({ path: "test-results/themes/glow-mobile.png" });
  await trigger.click();
  const language = page.getByRole("dialog").getByRole("combobox");
  for (const [lang, title] of [
    ["en", "Make it your space"],
    ["de", "Gestalte deinen Bereich"],
    ["ru", "Настройте своё пространство"],
    ["pt", "Personalize seu espaço"],
    ["fr", "Personnalisez votre espace"],
  ]) {
    await language.selectOption(lang);
    await expect(page.getByRole("dialog", { name: title })).toBeVisible();
    await expect(page.getByRole("radio")).toHaveCount(6);
    await expect
      .poll(() =>
        page
          .getByRole("dialog")
          .evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth),
      )
      .toBe(true);
  }
});

test("la preferencia se comparte entre pestañas y respeta Claro y Oscuro guardados", async ({
  page,
  context,
}) => {
  await page.goto("/");
  for (const saved of ["dark", "light"]) {
    await page.evaluate(
      (theme) => localStorage.setItem("forma-theme", theme),
      saved,
    );
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", saved);
  }
  const second = await context.newPage();
  await second.goto("/");
  await page.getByRole("button", { name: "Elegir tema" }).click();
  await page.getByRole("radio", { name: "Brisa", exact: true }).check();
  await expect(second.locator("html")).toHaveAttribute("data-theme", "breeze");
  await second.evaluate(() =>
    localStorage.setItem("forma-theme", "unknown-old-theme"),
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("el tema sigue disponible en el acceso y no cambia datos personales", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Elegir tema" }).click();
  await page.getByRole("radio", { name: "Cyberpunk", exact: true }).click();
  await page.getByRole("button", { name: "Listo", exact: true }).click();
  const before = await page.evaluate(() =>
    sessionStorage.getItem("forma-demo-v1"),
  );
  await page.getByRole("link", { name: "Mi cuerpo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mi cuerpo", exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "cyberpunk");
  await page.screenshot({ path: "test-results/themes/body-cyberpunk.png" });
  await page
    .getByRole("button", { name: "Salir de demostración", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Qué bueno verte" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Elegir tema" }).click();
  await page.getByRole("radio", { name: "Resplandor", exact: true }).click();
  await page.screenshot({
    path: "test-results/themes/selector-desktop.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Listo", exact: true }).click();
  await page.screenshot({ path: "test-results/themes/auth-glow.png" });
  expect(
    await page.evaluate(() => sessionStorage.getItem("forma-demo-v1")),
  ).toBe(before);
});
