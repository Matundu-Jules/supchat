import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useMessages } from "@hooks/useMessages";
import styles from "./MessagesPage.module.scss";

function MessagesPage() {
  const [params] = useSearchParams();
  const channelId = params.get("channel") || "";
  const { messages, loading, send } = useMessages(channelId);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    await send(text.trim(), file);
    setText("");
    setFile(null);
  };

  return (
    <section className={styles["container"]}>
      <ul className={styles["list"]}>
        {messages.map((m: any) => (
          <li key={m._id}>
            {m.text || m.content}
            {m.file && (
              <a href={m.file} target="_blank" rel="noopener noreferrer">
                {m.filename || "Fichier"}
              </a>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className={styles["form"]}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Envoyer
        </button>
      </form>
    </section>
  );
}

export default MessagesPage;
