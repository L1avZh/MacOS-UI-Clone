import { useNotesStore } from "@/state/notesStore";
import "./notes.css";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  return isToday
    ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function preview(body: string, title: string): string {
  const rest = body.split("\n").slice(1).join(" ").trim();
  return rest || (title === body.trim() ? "" : body.trim());
}

export default function Notes() {
  const notes = useNotesStore((s) => s.notes);
  const selectedId = useNotesStore((s) => s.selectedId);
  const select = useNotesStore((s) => s.select);
  const create = useNotesStore((s) => s.create);
  const update = useNotesStore((s) => s.update);
  const remove = useNotesStore((s) => s.remove);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="notes-app">
      <div className="notes-sidebar">
        <div className="notes-sidebar-header">
          <span>{notes.length} Notes</span>
          <button type="button" onClick={() => create()} aria-label="New note" className="notes-new-btn">
            +
          </button>
        </div>
        <ul className="notes-list">
          {notes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                className={note.id === selectedId ? "active" : ""}
                onClick={() => select(note.id)}
              >
                <strong>{note.title || "New Note"}</strong>
                <span className="notes-list-meta">
                  {formatDate(note.updatedAt)}
                  {preview(note.body, note.title) && ` — ${preview(note.body, note.title)}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="notes-editor">
        {selected ? (
          <>
            <div className="notes-editor-toolbar">
              <span>{formatDate(selected.updatedAt)}</span>
              <button type="button" onClick={() => remove(selected.id)} aria-label="Delete note">
                Delete
              </button>
            </div>
            <textarea
              key={selected.id}
              className="notes-textarea"
              defaultValue={selected.body}
              onChange={(e) => update(selected.id, e.target.value)}
              placeholder="Start typing…"
              aria-label="Note content"
              autoFocus
            />
          </>
        ) : (
          <div className="notes-empty">
            <p>No note selected</p>
            <button type="button" onClick={() => create()}>
              New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
