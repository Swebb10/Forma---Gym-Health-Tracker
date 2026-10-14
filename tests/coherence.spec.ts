import { test, expect } from "@playwright/test";
import type { Store } from "../src/types";
import { localDate } from "../src/lib/metrics";
const exercise = {
  id: "squat",
  name: "Sentadilla",
  group: "Cuádriceps",
  unit: "kg" as const,
  sets: [
    { weight: 100, reps: 8 },
    { weight: 90, reps: 8 },
    { weight: 90, reps: 8 },
  ],
};
const data: Store = {
  routines: [
    { id: "r", name: "Piernas", description: "", exercises: [exercise] },
  ],
  workouts: [],
  bioimpedance: [],
  measurements: [],
  weights: [],
};
test("borrador recuperable y solo series confirmadas, sin inventar duración ni resultados", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript((data) => {
    if (!sessionStorage.getItem("forma-demo-v1"))
      sessionStorage.setItem("forma-demo-v1", JSON.stringify(data));
  }, data);
  await page.goto("/#routines");
  await page.getByRole("button", { name: "Entrenar", exact: true }).click();
  await expect(page.getByLabel("Duración · minutos")).toHaveValue("");
  await expect(
    page.getByLabel("Serie 1 realizada", { exact: true }),
  ).not.toBeChecked();
  await page.getByLabel("Duración · minutos").fill("50");
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Confirma al menos una serie",
  );
  await page.getByLabel("Serie 1 realizada", { exact: true }).check();
  await page.getByLabel("Serie 3 realizada", { exact: true }).check();
  await page
    .getByLabel("Notas de la sesión")
    .fill("No realicé la segunda serie.");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Retomar borrador" }).click();
  await expect(page.getByLabel("Duración · minutos")).toHaveValue("50");
  await expect(
    page.getByLabel("Serie 3 realizada", { exact: true }),
  ).toBeChecked();
  await expect(
    page.getByLabel("Serie 2 realizada", { exact: true }),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Guardar registro" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Retomar borrador" }),
  ).toHaveCount(0);
  const records = await page.evaluate(
    () => JSON.parse(sessionStorage.getItem("forma-demo-v1")!).workouts,
  );
  expect(records).toHaveLength(1);
  expect(records[0].exercises[0].sets).toEqual([
    { weight: 100, reps: 8, position: 1 },
    { weight: 90, reps: 8, position: 3 },
  ]);
  await page.getByRole("link", { name: "Entrenamientos", exact: true }).click();
  await page
    .getByRole("button", { name: "Progreso por series", exact: true })
    .click();
  await page.getByLabel("Serie del gráfico").selectOption("2");
  await page.getByText("Ver datos del gráfico", { exact: true }).click();
  await expect(page.locator(".series-history")).toContainText("90 kg × 8 rep");
  expect(errors).toEqual([]);
});
test("rutina activa, enlaces exactos y filtros independientes en el Resumen", async ({
  page,
}) => {
  const fixture = {
    ...data,
    routines: [
      ...data.routines,
      { ...data.routines[0], id: "second", name: "Plan elegido" },
    ],
    workouts: [
      {
        id: "record-1",
        date: localDate(),
        routineId: "second",
        name: "Mi sesión precisa",
        duration: 60,
        notes: "Referencia",
        exercises: [exercise],
      },
    ],
  };
  await page.addInitScript((data) => {
    sessionStorage.setItem("forma-demo-v1", JSON.stringify(data));
  }, fixture);
  await page.goto("/#routines");
  await page.getByLabel("Rutina activa").selectOption("second");
  await page.getByRole("link", { name: "Resumen", exact: true }).click();
  await expect(page.locator(".routine-pick")).toContainText("Plan elegido");
  await page.getByLabel("Período de gráficos").selectOption("30");
  await expect(page.getByLabel("Período de fuerza")).toHaveValue("90");
  await page.locator(".recent-workout").first().click();
  await expect(page).toHaveURL(/session=record-1/);
  await expect(page.locator("#session-record-1 details")).toHaveAttribute(
    "open",
    "",
  );
  await page.getByRole("link", { name: "Resumen", exact: true }).click();
  await page
    .getByRole("button", { name: "Comparar cada serie en Entrenamientos" })
    .click();
  await expect(page).toHaveURL(/view=progress/);
  await expect(page.getByLabel("Ejercicio para comparar")).toContainText(
    "Sentadilla",
  );
  await expect(
    page.getByRole("heading", { name: "Tu progreso, serie por serie" }),
  ).toBeVisible();
});
test("Mi cuerpo en pantallas bajas y móviles permite llegar al perfil sin F11", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 650 });
  await page.goto("/#measurements");
  await expect(
    page.getByRole("heading", { name: "Mi cuerpo", exact: true }),
  ).toBeVisible();
  const bounds = await page.locator(".sidebar-bottom").evaluate((el) => ({
    top: el.getBoundingClientRect().top,
    bottom: el.getBoundingClientRect().bottom,
    height: innerHeight,
  }));
  expect(bounds.top).toBeGreaterThanOrEqual(0);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.height + 1);
  await page.screenshot({
    path: "test-results/body-desktop.png",
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
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/body-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
});
