// src/components/UserStatusBadge/index.tsx

import React from "react";
import styles from "./UserStatusBadge.module.scss";

export type UserStatus = "online" | "away" | "busy" | "offline";

interface UserStatusBadgeProps {
  status: UserStatus;
  showText?: boolean;
  size?: "small" | "medium" | "large";
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  status,
  showText = true,
  size = "medium",
}) => {
  // Normaliser le statut en cas de valeur undefined/null
  const normalizedStatus: UserStatus = status || "offline";

  const getStatusInfo = (status: UserStatus) => {
    switch (status) {
      case "online":
        return {
          icon: "🟢",
          text: "En ligne",
          className: styles["status-online"],
        };
      case "away":
        return {
          icon: "🟡",
          text: "Absent",
          className: styles["status-away"],
        };
      case "busy":
        return {
          icon: "🔴",
          text: "Occupé",
          className: styles["status-busy"],
        };
      case "offline":
      default:
        return {
          icon: "⚫",
          text: "Hors ligne",
          className: styles["status-offline"],
        };
    }
  };

  const statusInfo = getStatusInfo(normalizedStatus);

  return (
    <span
      className={`${styles["status-badge"]} ${statusInfo.className} ${
        styles[`size-${size}`]
      }`}
      title={statusInfo.text}
    >
      <span className={styles["status-icon"]}>{statusInfo.icon}</span>
      {showText && (
        <span className={styles["status-text"]}>{statusInfo.text}</span>
      )}
    </span>
  );
};

export default UserStatusBadge;
