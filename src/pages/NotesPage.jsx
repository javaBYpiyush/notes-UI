import { useEffect, useState } from "react";
import { api } from "../api";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [creating, setCreating] = useState({ title: "", content: "", isPublic: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await api.getNotes();
      setNotes(data);
    } catch (e) {
      setError("Failed to load notes");
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!creating.title.trim() && !creating.content.trim()) return;
    setBusy(true);
    try {
      // If your backend expects `public` instead of `isPublic`, change the key here
      await api.createNote({
        title: creating.title,
        content: creating.content,
        isPublic: creating.isPublic,
      });
      setCreating({ title: "", content: "", isPublic: false });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const update = async (n, patch) => {
    setBusy(true);
    try {
      const payload = {
        title: patch.title ?? n.title,
        content: patch.content ?? n.content,
        // Adjust key if your JSON is `public` instead of `isPublic`
        isPublic: patch.isPublic ?? n.isPublic ?? n.public,
      };
      await api.updateNote(n.id, payload);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await api.deleteNote(id);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const shareUrl = (n) => {
    // Frontend public view that fetches /note/share/{shareId}
    const base = window.location.origin;
    const sid = n.shareId;
    if (!sid) return "";
    return `${base}/n/${sid}`;
  };

  return (
    <div className="page">
      <h2>Your Notes</h2>

      {error && <div className="alert">{error}</div>}

      <div className="card">
        <h3>Create</h3>
        <input
          placeholder="Title"
          value={creating.title}
          onChange={e => setCreating(v => ({ ...v, title: e.target.value }))}
        />
        <textarea
          placeholder="Content"
          rows={5}
          value={creating.content}
          onChange={e => setCreating(v => ({ ...v, content: e.target.value }))}
        />
        <label className="checkbox">
          <input
            type="checkbox"
            checked={creating.isPublic}
            onChange={e => setCreating(v => ({ ...v, isPublic: e.target.checked }))}
          />
          Make public
        </label>
        <button onClick={create} disabled={busy}>Add</button>
      </div>

      <div className="list">
        {notes.length === 0 && <p>No notes yet</p>}
        {notes.map(n => (
          <NoteItem
            key={n.id}
            note={n}
            onUpdate={(patch) => update(n, patch)}
            onDelete={() => remove(n.id)}
            shareUrl={shareUrl(n)}
          />
        ))}
      </div>
    </div>
  );
}

function NoteItem({ note, onUpdate, onDelete, shareUrl }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    title: note.title || "",
    content: note.content || "",
    // Support either isPublic or public from backend
    isPublic: typeof note.isPublic === "boolean" ? note.isPublic : !!note.public,
  });

  useEffect(() => {
    setForm({
      title: note.title || "",
      content: note.content || "",
      isPublic: typeof note.isPublic === "boolean" ? note.isPublic : !!note.public,
    });
  }, [note.id]);

  const onTogglePublic = async () => {
    await onUpdate({ isPublic: !form.isPublic });
    setForm(f => ({ ...f, isPublic: !f.isPublic }));
  };

  const onSave = async () => {
    await onUpdate({ title: form.title, content: form.content });
    setEdit(false);
  };

  return (
    <div className="card">
      {edit ? (
        <>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <textarea
            rows={5}
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          />
          <div className="row">
            <button onClick={onSave}>Save</button>
            <button className="secondary" onClick={() => setEdit(false)}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <div className="row space">
            <h3>{note.title || "Untitled"}</h3>
            <div className="row">
              <button onClick={() => setEdit(true)}>Edit</button>
              <button className="danger" onClick={onDelete}>Delete</button>
            </div>
          </div>
          <p className="content">{note.content}</p>

          <label className="checkbox">
            <input type="checkbox" checked={form.isPublic} onChange={onTogglePublic} />
            Public
          </label>

          {form.isPublic && note.shareId && (
            <div className="share">
              <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
              <a href={shareUrl} target="_blank" rel="noreferrer">Open link</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
