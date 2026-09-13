import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
  window.localStorage.clear();
  vi.resetModules();
});

describe("notesStore", () => {
  it("seeds a welcome note when storage is empty", async () => {
    const { useNotesStore } = await import("./notesStore");
    expect(useNotesStore.getState().notes).toHaveLength(1);
    expect(useNotesStore.getState().notes[0]!.title).toBe("Welcome to Notes");
  });

  it("creates, updates, and persists a note across a simulated reload", async () => {
    const { useNotesStore } = await import("./notesStore");
    const id = useNotesStore.getState().create();
    useNotesStore.getState().update(id, "My New Note\nSome body text");

    vi.resetModules();
    const reloaded = await import("./notesStore");
    const note = reloaded.useNotesStore.getState().notes.find((n) => n.id === id);
    expect(note?.body).toBe("My New Note\nSome body text");
    expect(note?.title).toBe("My New Note");
  });

  it("deletes a note and falls back selection to another note", async () => {
    const { useNotesStore } = await import("./notesStore");
    const first = useNotesStore.getState().notes[0]!.id;
    const second = useNotesStore.getState().create();
    useNotesStore.getState().select(second);
    useNotesStore.getState().remove(second);
    expect(useNotesStore.getState().selectedId).toBe(first);
  });

  it("recovers gracefully from corrupted localStorage instead of crashing", async () => {
    window.localStorage.setItem("macos-ui-clone:notes", "{not valid json at all");
    const { useNotesStore } = await import("./notesStore");
    expect(useNotesStore.getState().notes.length).toBeGreaterThan(0);
  });
});
