import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useMessages } from "@hooks/useMessages";
import { useChannelDetails } from "@hooks/useChannelDetails";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import styles from "./MessagesPage.module.scss";
import MessageItem from "@components/Message/MessageItem";
import ChannelEditModal from "@components/Channel/ChannelEditModal";
import MessageInput from "@components/MessageInput";

function MessagesPage() {
  const [params] = useSearchParams();
  const channelId = params.get("channel") || "";
  const { messages, loading, send, update: updateMsg, remove } = useMessages(channelId);
  const {
    channel,
    loading: channelLoading,
    handleUpdate,
    handleDelete,
    updating,
    updateError,
  } = useChannelDetails(channelId);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showEdit, setShowEdit] = useState(false);
  const listRef = useRef<HTMLUListElement | null>(null);

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
          <MessageItem
            key={m._id}
            message={m}
            onEdit={(text: string, file?: File | null) =>
              updateMsg(m._id, text, file)
            }
            onDelete={() => remove(m._id)}
          />
        ))}
        {!loading && messages.length === 0 && (
          <li className={styles["empty"]}>Aucun message pour le moment.</li>
        )}
      </ul>
      <MessageInput onSend={send} loading={loading} />
      {showEdit && channel && (
        <ChannelEditModal
          channel={channel}
          onUpdate={handleUpdate}
          onDelete={async () => {
            const ws = await handleDelete();
            if (ws) {
              navigate(`/workspaces/${ws}`);
            }
          }}
          onClose={() => setShowEdit(false)}
          loading={updating}
          error={updateError}
        />
      )}
    </section>
  );
}

export default MessagesPage;
