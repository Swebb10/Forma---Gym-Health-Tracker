import { test, expect } from "@playwright/test";
import { catalogs } from "../src/lib/locales";
import type { Store, Exercise } from "../src/types";
const squat = (weights: number[]): Exercise => ({
  id: "squat",
  name: "Sentadilla",
  group: "Cuádriceps",
  unit: "kg",
  sets: weights.map((weight) => ({ weight, reps: 8 })),
});
const fixture: Store = {
  routines: [
    {
      id: "ppl",
      name: "Push Pull Legs",
      description: "",
      exercises: [squat([100, 90, 90, 90])],
      days: [
        {
          id: "legs",
          name: "Piernas",
          weekday: "Lunes",
          exercises: [squat([100, 90, 90, 90])],
        },
      ],
    },
  ],
  workouts: [
    {
      id: "before",
      date: "2026-10-01",
      routineId: "ppl",
      routineDayId: "legs",
      name: "Piernas",
      duration: 60,
      notes: "La primera serie salió bien.",
      exercises: [squat([100, 90, 90, 90])],
    },
    {
      id: "after",
      date: "2026-10-10",
      routineId: "ppl",
      routineDayId: "legs",
      name: "Piernas",
      duration: 60,
      notes: "Me cansé en las últimas series. Descansé poco.",
      exercises: [squat([100, 100, 100, 100])],
    },
  ],
  measurements: [],
  bioimpedance: [],
};
test.beforeEach(async ({ page }) => {
  await page.addInitScript((data) => {
    sessionStorage.setItem("forma-demo-v1", JSON.stringify(data));
  }, fixture);
});
test("muestra 1→4 series al mismo máximo, convierte unidades y conserva las referencias al registrar", async ({
  page,
}) => {
  await page.goto("/#workouts");
  await page
    .getByRole("button", { name: "Progreso por series", exact: true })
    .click();
  await expect(page.getByTestId("series-benchmark")).toContainText(
    "4 de 4 series",
  );
  await expect(page.getByTestId("series-benchmark")).toContainText(
    "Antes: 1 de 4 series",
  );
  const rows = page.locator(".set-comparison tbody tr");
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(0)).toContainText("Sin cambios");
  await expect(rows.nth(1)).toContainText("+10 kg");
  await page
    .getByRole("combobox", { name: "Mostrar pesos en", exact: true })
    .selectOption("lb");
  await expect(rows.nth(1)).toContainText("220,46 lb");
  await expect(page.getByTestId("series-benchmark")).toContainText(
    "4 de 4 series",
  );
  await page.getByLabel("Serie del gráfico").selectOption("3");
  await expect(
    page.getByRole("combobox", { name: "Métrica de la serie" }),
  ).toHaveCount(0);
  await expect(page.locator(".series-chart .recharts-line")).toHaveCount(2);
  await expect(page.locator(".series-chart-legend")).toContainText("Peso (lb)");
  await expect(page.locator(".series-chart-legend")).toContainText(
    "Repeticiones",
  );
  await page.getByText("Ver datos del gráfico", { exact: true }).click();
  await expect(page.locator(".series-history li")).toHaveCount(2);
  await expect(page.locator(".series-history li").first()).toContainText(
    "198,42 lb × 8 rep",
  );
  await expect(page.locator(".series-history li").last()).toContainText(
    "220,46 lb × 8 rep",
  );
  await page
    .locator(".series-chart .recharts-line-dots")
    .first()
    .locator("circle")
    .first()
    .hover();
  await expect(page.locator(".recharts-tooltip-wrapper")).toContainText(
    "198,42 lb",
  );
  await expect(page.locator(".recharts-tooltip-wrapper")).toContainText(
    "8 rep",
  );
  await page
    .getByRole("button", { name: "Registrar sesión", exact: true })
    .click();
  await page.getByLabel("Usar una rutina").selectOption("ppl");
  await expect(page.locator(".set-reference").nth(1)).toContainText(
    "100 kg × 8 rep",
  );
  await expect(
    page.getByLabel("Peso ejercicio 1 serie 2", { exact: true }),
  ).toHaveValue("90");
  await page.getByText(/Referencia anterior y notas/).click();
  await expect(
    page.getByRole("dialog").getByText("Notas para revisar"),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancelar", exact: true })
    .click();
});
test("revisa notas sin conexión, descargas, workers ni acceso a la GPU", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", {
      get() {
        throw new Error("Unexpected GPU access");
      },
      configurable: true,
    });
    window.Worker = class {
      constructor() {
        throw new Error("Unexpected worker");
      }
    } as unknown as typeof Worker;
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const remote: string[] = [];
  page.on("request", (r) => {
    if (/huggingface|mlc-ai.github.io/.test(r.url())) remote.push(r.url());
  });
  await page.goto("/#workouts");
  await page
    .getByRole("button", { name: "Progreso por series", exact: true })
    .click();
  expect(remote).toEqual([]);
  await expect(
    page.getByRole("button", { name: "Revisar mis notas", exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "Revisar mis notas", exact: true })
    .click();
  await expect(page.locator(".coach-results")).toContainText(
    "Revisa las últimas series",
  );
  await expect(page.locator(".coach-results blockquote")).toContainText(
    "Me cansé en las últimas series",
  );
  await expect(page.locator(".notes-coach")).toContainText(
    "basado en reglas, no en IA",
  );
  await expect(
    page.getByRole("button", { name: "Analizar notas con IA local" }),
  ).toHaveCount(0);
  await expect(page.locator(".notes-coach progress")).toHaveCount(0);
  expect(remote).toEqual([]);
  expect(errors).toEqual([]);
  await expect(page.locator(".set-comparison tbody tr")).toHaveCount(4);
});
test("descarta consejos al cambiar de sesión y no altera las notas guardadas", async ({
  page,
}) => {
  await page.goto("/#workouts");
  await page
    .getByRole("button", { name: "Progreso por series", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Revisar mis notas", exact: true })
    .click();
  await expect(page.locator(".coach-results")).toContainText(
    "Revisa las últimas series",
  );
  await expect(page.locator(".coach-results blockquote")).toContainText(
    "Me cansé en las últimas series",
  );
  await page
    .getByRole("combobox", { name: "Sesión seleccionada", exact: true })
    .selectOption({ index: 1 });
  await expect(page.locator(".coach-results")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Revisar mis notas", exact: true })
    .click();
  await expect(page.locator(".coach-results")).toContainText(
    "No encontramos frases",
  );
  const stored = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("forma-demo-v1")!),
  );
  expect(stored.workouts).toEqual(fixture.workouts);
});
test("traducciones y diseño móvil no alteran los datos del entrenamiento", async ({
  page,
}) => {
  await page.goto("/#workouts");
  await page
    .getByRole("button", { name: "Progreso por series", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const language of ["en", "de", "ru", "pt", "fr"] as const) {
    await page
      .locator(".topbar .language-selector select")
      .selectOption(language);
    await expect(
      page.getByRole("heading", {
        name: catalogs[language]["Tu progreso, serie por serie"],
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: catalogs[language]["Revisar mis notas"],
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(
    await page.evaluate(
      () =>
        JSON.parse(sessionStorage.getItem("forma-demo-v1")!).workouts[0]
          .exercises[0].sets[1].weight,
    ),
  ).toBe(90);
});
