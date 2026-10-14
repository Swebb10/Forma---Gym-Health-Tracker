import {
  parseNoteSignals,
  type NoteSource,
  type NoteSignal,
} from "./noteCoach";
export async function analyzeNotes(
  sources: NoteSource[],
  signal: AbortSignal,
  onProgress: (progress: number) => void,
): Promise<NoteSignal[]> {
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
  const gpu = (
    navigator as Navigator & {
      gpu?: { requestAdapter: () => Promise<unknown> };
    }
  ).gpu;
  if (!gpu || !(await gpu.requestAdapter())) throw new Error("unsupported-gpu");
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
  const worker = new Worker(new URL("./notes.worker.ts", import.meta.url), {
    type: "module",
  });
  let abort: () => void = () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await new Promise<NoteSignal[]>((resolve, reject) => {
      abort = () => reject(new DOMException("Cancelled", "AbortError"));
      signal.addEventListener("abort", abort, { once: true });
      timer = setTimeout(
        () => reject(new Error("model-timeout")),
        5 * 60 * 1000,
      );
      worker.onerror = () => reject(new Error("worker-failed"));
      worker.onmessage = (event: MessageEvent) => {
        if (signal.aborted) return;
        if (event.data.type === "progress")
          onProgress(Math.max(0, Math.min(1, event.data.progress)));
        if (event.data.type === "error") reject(new Error("model-failed"));
        if (event.data.type === "result") {
          try {
            resolve(parseNoteSignals(event.data.raw, sources));
          } catch {
            reject(new Error("invalid-output"));
          }
        }
      };
      worker.postMessage({ sources });
    });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
    worker.terminate();
  }
}
