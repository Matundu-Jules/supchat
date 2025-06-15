import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import { useChannelPermissions } from "@hooks/useChannelPermissions";
import styles from "./MessageItem.module.scss";
import ReactionBar from "../ReactionBar";

interface MessageItemProps {
  message: any;
  channelId?: string;
  workspaceId?: string;
  onEdit?: (text: string, file?: File | null) => void;
  onDelete?: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  channelId,
  workspaceId,
  onEdit,
  onDelete,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(message.text || "");
  const [file, setFile] = useState<File | null>(null);

  const messageChannelId = channelId || message.channelId || message.channel;
  const { canEdit: canEditChannel } = useChannelPermissions(
    messageChannelId,
    workspaceId
  );

  const isImage = message.mimetype && message.mimetype.startsWith("image/");

  // Un utilisateur peut éditer son message s'il est :
  // 1. L'auteur du message, OU
  // 2. Admin global, OU
  // 3. Admin du canal
  const canEdit =
    user &&
    (String(user.email) === message.userId?.email ||
      user.role === "admin" ||
      canEditChannel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit?.(text, file);
    setEditing(false);
    setFile(null);
  };
  return (
    <li className={styles["item"]}>
      <div className={styles["meta"]}>
        <span className={styles["author"]}>
          {message.userId?.username || message.userId?.email || "Utilisateur"}
        </span>
        <span className={styles["time"]}>
          {new Date(message.createdAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className={styles["editForm"]}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Modifier votre message..."
            autoFocus
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />{" "}
          <div className={styles["actions"]}>
            <button className={styles["btn-success"]} type="submit">
              Enregistrer
            </button>
            <button
              className={styles["btn-cancel"]}
              type="button"
              onClick={() => setEditing(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <>
          {message.text && <p className={styles["text"]}>{message.text}</p>}
          {isImage ? (
            <img
              src={message.file}
              alt={message.filename || "Image"}
              className={styles["image"]}
              loading="lazy"
            />
          ) : (
            message.file && (
              <a
                href={message.file}
                target="_blank"
                rel="noopener noreferrer"
                className={styles["file"]}
                title={`Télécharger ${message.filename || "ce fichier"}`}
              >
                {message.filename || "Fichier"}
              </a>
            )
          )}
          <ReactionBar messageId={message._id} />
          {canEdit && (
            <div className={styles["actions"]}>
              <button
                className={styles["btn-secondary"]}
                type="button"
                onClick={() => setEditing(true)}
                title="Modifier ce message"
              >
                Éditer
              </button>
              <button
                className={styles["btn-delete"]}
                type="button"
                onClick={() => onDelete?.()}
                title="Supprimer ce message"
              >
                Supprimer
              </button>
            </div>
          )}
        </>
      )}
    </li>
  );
};

export default MessageItem;
