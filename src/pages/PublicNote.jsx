import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export default function PublicNote() {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        const data = await api.getPublicNote(shareId);
        setNote(data);
      } catch {
        setError("Note not found or not public");
      }
    })();
  }, [shareId]);

  if (error) return <div className="page"><div className="alert">{error}</div></div>;
  if (!note) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <div className="card">
        <h2>{note.title || "Untitled"}</h2>
        <p className="content">{note.content}</p>
      </div>
    </div>
  );
}
