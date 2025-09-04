import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE + "/api/notes";
console.log("API_BASE =", API_BASE);
console.log("API_BASE =", import.meta.env.VITE_API_BASE + "/api/notes");
function generateShareId() {
  return Math.random().toString(36).substr(2, 9);
}
export default function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  // Fetch notes on load
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/getnote`);
        console.log("Fetch status:", res.status);
        const text = await res.text();
        console.log("Raw response:", text);
        const data = JSON.parse(text);  // try parsing manually
        setNotes(data);
      } catch (err) {
        console.error("Error fetching notes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);



  // Create note
  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle?.trim() || "Untitled",   // ensure title is not null
          content: newNote.trim(),
          public: false,
          shareId: generateShareId()               // always send a valid shareId
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend error:", errText);
        throw new Error("Failed to add note");
      }

      const saved = await res.json();
      setNotes([...notes, saved]);
      setNewNote("");
      setNewTitle("");
    } catch (err) {
      console.error(err);
    }
  };


  // Delete note
  const deleteNote = async (id) => {
    await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    setNotes(notes.filter((n) => n.id !== id));
  };

  // Start editing
  // Start editing
  const startEdit = (note) => {
    setEditId(note.id);
    setEditText(note.content);  // body
    setEditTitle(note.title);   // title
  };


  // Save edited note
const saveEdit = async () => {
  if (!editId) return;

  const currentNote = notes.find((n) => n.id === editId);
  if (!currentNote) return;

  try {
    const res = await fetch(`${API_BASE}/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle || currentNote.title,   // keep old title if empty
        content: editText || currentNote.content, // keep old content if empty
        public: currentNote.public,  
        shareId: currentNote.shareId 
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to update note");
    }

    const updated = await res.json();
    setNotes(notes.map((n) => (n.id === editId ? updated : n)));
  } catch (err) {
    console.error("Error saving note:", err);
  } finally {
    setEditId(null);
    setEditText("");
    setEditTitle("");
  }
};



  if (loading) return <p>Loading notes...</p>;

  return (
    <div className="container">
      <h1>Notes App</h1>

      {/* Add note */}
      <div className="add-note">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title"
        />
        <input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a new note..."
        />
        <button onClick={addNote}>Add</button>
      </div>

      {/* Notes list */}
      <ul className="notes-list">
  {notes.map((note) => (
    <li key={note.id} className="note">
      <div className="note-main">
        {editId === note.id ? (
          <>
            <input
              className="note-title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Edit title..."
            />
            <textarea
              className="note-body note-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              placeholder="Edit your note..."
            />
          </>
        ) : (
          <>
            <div className="note-title">{note.title || "Untitled"}</div>
            <div className="note-body">{note.content}</div>
          </>
        )}
      </div>

      <div className="note-actions">
        {editId === note.id ? (
          <button onClick={saveEdit}>Save</button>
        ) : (
          <>
            <button onClick={() => startEdit(note)}>Edit</button>
            <button onClick={() => deleteNote(note.id)}>Delete</button>
            <a
              href={`${API_BASE}/${note.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share
            </a>
          </>
        )}
      </div>
    </li>
  ))}
</ul>

      {notes.length === 0 && <p>No notes yet. Add one!</p>}
    </div>
  );

}
