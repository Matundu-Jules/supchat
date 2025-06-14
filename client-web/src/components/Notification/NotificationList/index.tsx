import React from "react";
import styles from "./NotificationList.module.scss";

interface NotificationListProps {
  items: any[];
  onRead?: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ items, onRead }) => {
  if (!items.length) {
    return <p>Aucune notification.</p>;
  }

  return (
    <ul className={styles["list"]}>
      {items.map((n) => (
        <li
          key={n._id}
          className={`${styles["item"]} ${!n.read ? styles["unread"] : ""}`}
        >
          <span className={styles["text"]}>
            {(n.messageId?.text || "Nouvelle activité").slice(0, 80)}
          </span>
          {!n.read && onRead && (
            <button
              type="button"
              className="btn"
              onClick={() => onRead(n._id)}
            >
              Marquer comme lu
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default NotificationList;
