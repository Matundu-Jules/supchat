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
  onAccess?: (channel: Channel) => void;
}

const ChannelList: React.FC<ChannelListProps> = ({ channels, onAccess }) => {
  if (!channels.length) {
    return <p>Aucun canal pour le moment.</p>;
  }

  return (
    <ul className={styles["channel-list"]}>
      {channels.map((ch) => (
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
