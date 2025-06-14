import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@store/store";
import styles from "./MessageItem.module.scss";
import ReactionBar from "../ReactionBar";

interface MessageItemProps {
  message: any;
  onEdit?: (text: string, file?: File | null) => void;
  onDelete?: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onEdit, onDelete }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(message.text || "");
  const [file, setFile] = useState<File | null>(null);

  const isImage = message.mimetype && message.mimetype.startsWith("image/");
  const canEdit =
    user &&
    (user.role === "admin" || String(user.email) === message.userId?.email);

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
          {new Date(message.createdAt).toLocaleString()}
        </span>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className={styles["editForm"]}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={() => setEditing(false)}>
            Annuler
          </button>
        </form>
      ) : (
        <>
          {message.text && <p className={styles["text"]}>{message.text}</p>}
          {isImage ? (
            <img
              src={message.file}
              alt={message.filename || ""}
              className={styles["image"]}
            />
          ) : (
            message.file && (
              <a
                href={message.file}
                target="_blank"
                rel="noopener noreferrer"
                className={styles["file"]}
              >
                {message.filename || "Fichier"}
              </a>
            )
          )}
          <ReactionBar messageId={message._id} />
          {canEdit && (
            <div className={styles["actions"]}>
              <button type="button" onClick={() => setEditing(true)}>
                Éditer
              </button>
              <button type="button" onClick={() => onDelete?.()}>Supprimer</button>
            </div>
          )}
        </>
      )}
    </li>
  );
};

export default MessageItem;
