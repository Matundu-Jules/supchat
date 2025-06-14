import React from "react";
import styles from "./NotificationPrefList.module.scss";

export interface Pref {
  channelId: { _id: string; name: string } | string;
  mode: "all" | "mentions" | "mute";
}

interface Props {
  items: Pref[];
  onChange: (channelId: string, mode: "all" | "mentions" | "mute") => void;
}

const NotificationPrefList: React.FC<Props> = ({ items, onChange }) => {
  if (!items.length) return <p>Aucun canal.</p>;
  return (
    <ul className={styles["list"]}>
      {items.map((p) => (
        <li key={typeof p.channelId === "string" ? p.channelId : p.channelId._id} className={styles["item"]}>
          <span>
            {typeof p.channelId === "string" ? p.channelId : p.channelId.name}
          </span>
          <select
            value={p.mode}
            onChange={(e) =>
              onChange(
                typeof p.channelId === "string" ? p.channelId : p.channelId._id,
                e.target.value as "all" | "mentions" | "mute"
              )
            }
          >
            <option value="all">All</option>
            <option value="mentions">Mentions only</option>
            <option value="mute">Mute</option>
          </select>
        </li>
      ))}
    </ul>
  );
};

export default NotificationPrefList;
