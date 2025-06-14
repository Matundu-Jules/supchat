import React from "react";
import styles from "./MessageItem.module.scss";
import ReactionBar from "../ReactionBar";

interface MessageItemProps {
  message: any;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isImage = message.mimetype && message.mimetype.startsWith("image/");
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
    </li>
  );
};

export default MessageItem;
