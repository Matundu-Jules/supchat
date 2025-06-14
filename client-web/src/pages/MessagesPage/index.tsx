import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useMessages } from "@hooks/useMessages";
import { useChannelDetails } from "@hooks/useChannelDetails";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import styles from "./MessagesPage.module.scss";
import MessageItem from "@components/Message/MessageItem";
import ChannelEditModal from "@components/Channel/ChannelEditModal";

function MessagesPage() {
  const [params] = useSearchParams();
  const channelId = params.get("channel") || "";
  const { messages, loading, send } = useMessages(channelId);
  const {
    channel,
    loading: channelLoading,
    handleUpdate,
    updating,
    updateError,
  } = useChannelDetails(channelId);
  const user = useSelector((state: RootState) => state.auth.user);
  const [showEdit, setShowEdit] = useState(false);
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

  const canEdit = user && user.role === "admin";

  return (
    <section className={styles["container"]}>
      <div className={styles["header"]}>
        <h2 className={styles["title"]}>{channel?.name || "Canal"}</h2>
        {canEdit && channel && (
          <button
            type="button"
            className={styles["editButton"]}
            onClick={() => setShowEdit(true)}
          >
            Modifier
          </button>
        )}
      </div>
      <ul ref={listRef} className={styles["list"]}>
        {messages.map((m: any) => (
          <MessageItem key={m._id} message={m} />
        ))}
        {!loading && messages.length === 0 && (
          <li className={styles["empty"]}>Aucun message pour le moment.</li>
        )}
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
      {showEdit && channel && (
        <ChannelEditModal
          channel={channel}
          onUpdate={handleUpdate}
          onClose={() => setShowEdit(false)}
          loading={updating}
          error={updateError}
        />
      )}
    </section>
  );
}

export default MessagesPage;
