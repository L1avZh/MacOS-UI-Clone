import { create } from "zustand";
import { createId } from "@/utils/id";
import { readStorage, writeStorage } from "@/utils/storage";

export interface Note {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

const STORAGE_KEY = "macos-ui-clone:notes";

interface StoredNotes {
  notes: Note[];
}

function firstLine(body: string): string {
  const line = body.split("\n")[0]?.trim();
  return line && line.length > 0 ? line.slice(0, 60) : "New Note";
}

function isValidNote(value: unknown): value is Note {
  if (typeof value !== "object" || value === null) return false;
  const n = value as Record<string, unknown>;
  return typeof n.id === "string" && typeof n.title === "string" && typeof n.body === "string" && typeof n.updatedAt === "number";
}

function loadInitial(): Note[] {
  const stored = readStorage<StoredNotes>(STORAGE_KEY, { notes: [] });
  const notes = Array.isArray(stored.notes) ? stored.notes.filter(isValidNote) : [];
  if (notes.length > 0) return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  const welcome: Note = {
    id: createId("note"),
    title: "Welcome to Notes",
    body: "Welcome to Notes\n\nAnything you write here is saved automatically and stays on this device.",
    updatedAt: Date.now(),
  };
  return [welcome];
}

interface NotesState {
  notes: Note[];
  selectedId: string | null;
  select: (id: string | null) => void;
  create: () => string;
  update: (id: string, body: string) => void;
  remove: (id: string) => void;
}

function persist(notes: Note[]): void {
  writeStorage<StoredNotes>(STORAGE_KEY, { notes });
}

const initialNotes = loadInitial();

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: initialNotes,
  selectedId: initialNotes[0]?.id ?? null,
  select: (id) => set({ selectedId: id }),
  create: () => {
    const note: Note = { id: createId("note"), title: "New Note", body: "", updatedAt: Date.now() };
    const notes = [note, ...get().notes];
    persist(notes);
    set({ notes, selectedId: note.id });
    return note.id;
  },
  update: (id, body) => {
    const notes = get()
      .notes.map((n) => (n.id === id ? { ...n, body, title: firstLine(body), updatedAt: Date.now() } : n))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    persist(notes);
    set({ notes });
  },
  remove: (id) => {
    const notes = get().notes.filter((n) => n.id !== id);
    persist(notes);
    set((state) => ({ notes, selectedId: state.selectedId === id ? notes[0]?.id ?? null : state.selectedId }));
  },
}));
