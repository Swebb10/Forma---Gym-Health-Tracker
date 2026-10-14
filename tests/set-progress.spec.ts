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
  await page.getByLabel("Métrica de la serie").selectOption("reps");
  await page.getByText("Ver datos del gráfico", { exact: true }).click();
  await expect(page.locator(".series-history li")).toHaveCount(2);
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
    page.getByRole("dialog").getByText("Notas que se van a analizar"),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancelar", exact: true })
    .click();
});
test("no descarga IA al navegar y ofrece alternativa si no hay WebGPU", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    }),
  );
  const remote: string[] = [];
  page.on("request", (r) => {
    if (/huggingface|mlc-ai.github.io/.test(r.url())) remote.push(r.url());
  });
  await page.goto("/#workouts");
  await page
    .getByRole("button", { name: "Progreso por series", exact: true })
    .click();
  expect(remote).toEqual([]);
  await page
    .getByRole("button", { name: "Analizar notas con IA local" })
    .click();
  await expect(page.getByRole("alert")).toContainText("no dispone de WebGPU");
  expect(remote).toEqual([]);
  await expect(page.locator(".set-comparison tbody tr")).toHaveCount(4);
});
test("muestra consejos con citas y cancela el worker al salir (modelo simulado)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", {
      value: { requestAdapter: async () => ({}) },
      configurable: true,
    });
    const NativeWorker = window.Worker;
    class TestWorker {
      onmessage: ((event: { data: unknown }) => void) | null = null;
      constructor(url: string | URL, options?: WorkerOptions) {
        if (!String(url).includes("notes.worker"))
          return new NativeWorker(url, options) as unknown as TestWorker;
      }
      postMessage(data: { sources: { id: string; notes: string }[] }) {
        setTimeout(
          () =>
            this.onmessage?.({
              data: {
                type: "result",
                raw: JSON.stringify({
                  signals: [
                    {
                      topic: "fatigue",
                      sourceId: data.sources[0].id,
                      quote: "Me cansé en las últimas series",
                    },
                  ],
                }),
              },
            }),
          50,
        );
      }
      terminate() {
        (window as unknown as { terminated: number }).terminated =
          ((window as unknown as { terminated: number }).terminated ?? 0) + 1;
      }
    }
    window.Worker = TestWorker as unknown as typeof Worker;
  });
  await page.goto("/#workouts");
  await page
    .getByRole("button", { name: "Progreso por series", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Analizar notas con IA local" })
    .click();
  await expect(page.locator(".coach-results")).toContainText(
    "Revisa las últimas series",
  );
  await expect(page.locator(".coach-results blockquote")).toContainText(
    "Me cansé en las últimas series",
  );
  expect(
    await page.evaluate(
      () => (window as unknown as { terminated: number }).terminated,
    ),
  ).toBe(1);
  await page
    .getByRole("combobox", { name: "Sesión seleccionada", exact: true })
    .selectOption({ index: 1 });
  await expect(page.locator(".coach-results")).toHaveCount(0);
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
