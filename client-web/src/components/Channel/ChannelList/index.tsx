import React from "react";
import styles from "./ChannelList.module.scss";

export type Channel = {
  _id: string;
  name: string;
  description?: string;
  type?: string;
};

interface ChannelListProps {
  channels: Channel[];
  filter?: string;
  onAccess?: (channel: Channel) => void;
}

const ChannelList: React.FC<ChannelListProps> = ({ channels, filter, onAccess }) => {
  const lowered = filter ? filter.toLowerCase() : "";
  const filtered = lowered
    ? channels.filter(
        (c) =>
          c.name.toLowerCase().includes(lowered) ||
          (c.description || "").toLowerCase().includes(lowered)
      )
    : channels;

  if (!filtered.length) {
    return <p>Aucun canal pour le moment.</p>;
  }

  return (
    <ul className={styles["channel-list"]}>
      {filtered.map((ch) => (
        <li key={ch._id} className={styles["channel-item"]}>
          <div className={styles["channel-header"]}>
            <strong>{ch.name}</strong>
            {ch.type && <span className={styles["channel-badge"]}>{ch.type}</span>}
          </div>
          {ch.description && (
            <p className={styles["channel-description"]}>{ch.description}</p>
          )}
          {onAccess && (
            <button
              type="button"
              className="btn"
              onClick={() => onAccess(ch)}
            >
              Ouvrir
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ChannelList;
