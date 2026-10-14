import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeNotes } from "./localNotesAI";
const sources = [
  { id: "a", date: "2026-10-01", notes: "Dormí poco antes del entrenamiento." },
];
let worker: FakeWorker;
class FakeWorker {
  onmessage: ((e: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() {
    worker = this;
  }
}
const setup = () => {
  vi.stubGlobal("Worker", FakeWorker);
  vi.stubGlobal("navigator", { gpu: { requestAdapter: async () => ({}) } });
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("local AI lifecycle (worker mocked, not model inference)", () => {
  it("does not start a model on unsupported devices", async () => {
    vi.stubGlobal("navigator", {});
    const constructor = vi.fn();
    vi.stubGlobal("Worker", constructor);
    await expect(
      analyzeNotes(sources, new AbortController().signal, vi.fn()),
    ).rejects.toThrow("unsupported-gpu");
    expect(constructor).not.toHaveBeenCalled();
  });
  it("validates model output and releases the worker", async () => {
    setup();
    const progress = vi.fn();
    const task = analyzeNotes(sources, new AbortController().signal, progress);
    await Promise.resolve();
    worker.onmessage!({ data: { type: "progress", progress: 0.5 } });
    worker.onmessage!({
      data: {
        type: "result",
        raw: JSON.stringify({
          signals: [{ topic: "recovery", sourceId: "a", quote: "Dormí poco" }],
        }),
      },
    });
    expect(await task).toHaveLength(1);
    expect(progress).toHaveBeenCalledWith(0.5);
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
  it("cancels loading or inference without retaining a result", async () => {
    setup();
    const controller = new AbortController();
    const task = analyzeNotes(sources, controller.signal, vi.fn());
    await Promise.resolve();
    controller.abort();
    await expect(task).rejects.toMatchObject({ name: "AbortError" });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
  it("stops a stalled model after five minutes", async () => {
    setup();
    vi.useFakeTimers();
    const task = analyzeNotes(sources, new AbortController().signal, vi.fn());
    const expectation = expect(task).rejects.toThrow("model-timeout");
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(300000);
    await expectation;
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});
