import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useMessages } from "@hooks/useMessages";
import styles from "./MessagesPage.module.scss";

function MessagesPage() {
  const [params] = useSearchParams();
  const channelId = params.get("channel") || "";
  const { messages, loading, send } = useMessages(channelId);
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await send(text.trim());
    setText("");
  };

  return (
    <section className={styles["container"]}>
      <ul className={styles["list"]}>
        {messages.map((m: any) => (
          <li key={m._id}>{m.text || m.content}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className={styles["form"]}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
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
