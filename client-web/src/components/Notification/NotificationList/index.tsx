import React from "react";
import styles from "./NotificationList.module.scss";

function getNotificationLabel(n: any) {
  switch (n.type) {
    case "workspace_invite":
      return `Invité à rejoindre ${n.workspaceId?.name}`;
    case "channel_invite":
      return `Invité à rejoindre ${n.channelId?.name}`;
    default:
      return n.messageId?.text || "Nouvelle activité";
  }
}

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
            {getNotificationLabel(n).slice(0, 80)}
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
