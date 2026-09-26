import { test, expect } from "@playwright/test";
test("plan de tres días, unidades por ejercicio y sesiones independientes", async ({
  page,
}) => {
  await page.goto("/#routines");
  await page.getByRole("button", { name: "Nueva rutina", exact: true }).click();
  await page.getByLabel("Nombre de la rutina").fill("Push, Pull & Legs");
  const sessions = [
    {
      weekday: "Lunes",
      name: "Push",
      exercise: "Press de prueba",
      group: "Tríceps",
      weight: "100",
      unit: "lb",
    },
    {
      weekday: "Miércoles",
      name: "Pull",
      exercise: "Remo de prueba",
      group: "Antebrazos",
      weight: "42.5",
      unit: "kg",
    },
    {
      weekday: "Viernes",
      name: "Legs",
      exercise: "Sentadilla de prueba",
      group: "Cuádriceps",
      weight: "135",
      unit: "lb",
    },
  ];
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    if (i)
      await page
        .getByRole("button", { name: "Añadir día", exact: true })
        .click();
    await page.getByLabel("Día de la semana").selectOption(s.weekday);
    await page.getByLabel("Nombre de la sesión", { exact: true }).fill(s.name);
    await page.getByLabel("Nombre del ejercicio").fill(s.exercise);
    await page.getByLabel("Grupo muscular").selectOption(s.group);
    await page.getByLabel("Unidad del peso").selectOption(s.unit);
    await page
      .getByLabel("Peso ejercicio 1 serie 1", { exact: true })
      .fill(s.weight);
  }
  await page.getByRole("button", { name: "Guardar registro" }).click();
  const card = page.locator(".routine-card").filter({
    has: page.getByRole("heading", {
      name: "Push, Pull & Legs",
      exact: true,
    }),
  });
  await expect(
    card.getByRole("button", { name: "Entrenar Lunes · Push", exact: true }),
  ).toBeVisible();
  await expect(
    card.getByRole("button", {
      name: "Entrenar Miércoles · Pull",
      exact: true,
    }),
  ).toBeVisible();
  await card
    .getByRole("button", { name: "Entrenar Miércoles · Pull", exact: true })
    .click();
  await expect(page.getByLabel("Nombre del ejercicio")).toHaveValue(
    "Remo de prueba",
  );
  await expect(page.getByLabel("Unidad del peso")).toHaveValue("kg");
  await expect(page.locator(".exercise-box")).toHaveCount(1);
  await page
    .getByLabel("Día de la rutina")
    .selectOption({ label: "Viernes · Legs" });
  await expect(page.getByLabel("Nombre del ejercicio")).toHaveValue(
    "Sentadilla de prueba",
  );
  await expect(page.getByLabel("Unidad del peso")).toHaveValue("lb");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await card.getByRole("button", { name: "Editar Push, Pull & Legs" }).click();
  await expect(
    page.getByRole("button", { name: "03 Viernes · Legs" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "03 Viernes · Legs" }).click();
  await page.getByLabel("Nombre del ejercicio").fill("Sentadilla modificada");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await page.getByRole("link", { name: "Entrenamientos", exact: true }).click();
  const session = page.locator(".workout-card").filter({
    has: page.getByRole("heading", {
      name: "Push, Pull & Legs · Legs",
      exact: true,
    }),
  });
  await session.locator("summary").click();
  await expect(session).toContainText("Sentadilla de prueba");
  await expect(session).toContainText("135 lb");
  await page.reload();
  await session.getByRole("button", { name: /Editar sesión/ }).click();
  await expect(page.getByLabel("Nombre del ejercicio")).toHaveValue(
    "Sentadilla de prueba",
  );
  await expect(page.getByLabel("Unidad del peso")).toHaveValue("lb");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.getByRole("link", { name: "Resumen", exact: true }).click();
  await page
    .getByLabel("Ejercicio del gráfico")
    .selectOption("Sentadilla de prueba");
  await page.getByLabel("Unidad del gráfico de fuerza").selectOption("lb");
  await expect(page.locator(".strength-panel .chart")).toHaveAttribute(
    "aria-label",
    /135 lb/,
  );
});
test("17 medidas diferenciadas, edición e historial anterior sin pérdida", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#measurements");
  await page.getByRole("button", { name: "Añadir medidas" }).click();
  const fields = page.getByRole("dialog").locator('input[type="number"]');
  await expect(fields).toHaveCount(17);
  await page
    .getByLabel("Brazo Izquierdo (Relajado) · cm", { exact: true })
    .fill("31.2");
  await page
    .getByLabel("Brazo Derecho (Contraído) · cm", { exact: true })
    .fill("36.4");
  await page
    .getByLabel("Muslo Izquierdo (Alto) · cm", { exact: true })
    .fill("57.8");
  await page
    .getByLabel("Pantorrilla Derecha · cm", { exact: true })
    .fill("38.1");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await page
    .getByRole("button", { name: "Tren Superior", exact: true })
    .click();
  await page
    .getByRole("button", { name: /Brazo Izquierdo \(Relajado\)/ })
    .click();
  await expect(
    page.getByRole("cell", { name: "31,2", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Ver medidas del/ })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("57,8 cm");
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page
    .getByRole("button", { name: "Registros anteriores", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Bíceps \(registro anterior/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Editar medidas del/ })
    .last()
    .click();
  await expect(
    page.getByLabel("Bíceps (registro anterior, sin lado) · cm", {
      exact: true,
    }),
  ).toHaveValue("34");
  await page.getByLabel("Antebrazo Derecho · cm", { exact: true }).fill("27.5");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await page.reload();
  await page
    .getByRole("button", { name: /Editar medidas del/ })
    .last()
    .click();
  await expect(
    page.getByLabel("Bíceps (registro anterior, sin lado) · cm", {
      exact: true,
    }),
  ).toHaveValue("34");
  await expect(
    page.getByLabel("Antebrazo Derecho · cm", { exact: true }),
  ).toHaveValue("27.5");
});
