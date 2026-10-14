import { MLCEngine } from "@mlc-ai/web-llm";
import {
  NOTES_MODEL,
  notesPrompt,
  noteResponseSchema,
  type NoteSource,
} from "./noteCoach";
self.onmessage = async (event: MessageEvent<{ sources: NoteSource[] }>) => {
  try {
    const engine = new MLCEngine({
      initProgressCallback: (report) =>
        self.postMessage({ type: "progress", progress: report.progress }),
    });
    await engine.reload(NOTES_MODEL, { context_window_size: 4096 });
    self.postMessage({ type: "progress", progress: 1 });
    const response = await engine.chat.completions.create({
      messages: notesPrompt(event.data.sources),
      temperature: 0,
      max_tokens: 350,
      response_format: {
        type: "json_object",
        schema: JSON.stringify(noteResponseSchema),
      },
    });
    if (response.choices[0]?.finish_reason === "length")
      throw new Error("incomplete-output");
    self.postMessage({
      type: "result",
      raw: response.choices[0]?.message.content ?? "",
    });
  } catch {
    self.postMessage({ type: "error" });
  }
};
