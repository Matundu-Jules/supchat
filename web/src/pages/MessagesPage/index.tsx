import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useMessages } from "@hooks/useMessages";
import { useChannelDetails } from "@hooks/useChannelDetails";
import { useChannelPermissions } from "@hooks/useChannelPermissions";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import styles from "./MessagesPage.module.scss";
import MessageItem from "@components/Message/MessageItem";
import ChannelEditModal from "@components/Channel/ChannelEditModal";
import MessageInput from "@components/MessageInput";

function MessagesPage() {
  const [params] = useSearchParams();
  const channelId = params.get("channel") || "";
  const {
    messages,
    loading,
    send,
    update: updateMsg,
    remove,
  } = useMessages(channelId);
  const { channel, handleUpdate, handleDelete, updating, updateError } =
    useChannelDetails(channelId);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showEdit, setShowEdit] = useState(false);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Utiliser les permissions de canal au lieu du rôle global uniquement
  const { canEdit: canEditChannel } = useChannelPermissions(
    channelId,
    channel?.workspace
  );

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className={styles["container"]}>
      <div className={styles["header"]}>
        <h2 className={styles["title"]}>{channel?.name || "Canal"}</h2>
      </div>
      <ul ref={listRef} className={styles["list"]}>
        {messages.map((m: any) => (
          <MessageItem
            key={m._id}
            message={m}
            channelId={channelId}
            workspaceId={channel?.workspace}
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
