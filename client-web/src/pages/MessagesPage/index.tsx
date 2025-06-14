import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useMessages } from "@hooks/useMessages";
import styles from "./MessagesPage.module.scss";
import MessageItem from "@components/Message/MessageItem";

function MessagesPage() {
  const [params] = useSearchParams();
  const channelId = params.get("channel") || "";
  const { messages, loading, send } = useMessages(channelId);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    await send(text.trim(), file);
    setText("");
    setFile(null);
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className={styles["container"]}>
      <ul ref={listRef} className={styles["list"]}>
        {messages.map((m: any) => (
          <MessageItem key={m._id} message={m} />
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
