// src/components/UserRoleBadge/index.tsx

import React from "react";
import styles from "./UserRoleBadge.module.scss";

export type UserRole = "propriétaire" | "admin" | "membre" | "invité";

interface UserRoleBadgeProps {
  role: UserRole;
  size?: "small" | "medium" | "large";
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  role,
  size = "medium",
}) => {
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case "propriétaire":
        return {
          icon: "👑",
          text: "Propriétaire",
          className: styles["role-owner"],
        };
      case "admin":
        return {
          icon: "⚡",
          text: "Admin",
          className: styles["role-admin"],
        };
      case "membre":
        return {
          icon: "👤",
          text: "Membre",
          className: styles["role-member"],
        };
      case "invité":
        return {
          icon: "👁️",
          text: "Invité",
          className: styles["role-guest"],
        };
      default:
        return {
          icon: "👤",
          text: "Membre",
          className: styles["role-member"],
        };
    }
  };

  const roleInfo = getRoleInfo(role);

  return (
    <span
      className={`${styles["role-badge"]} ${roleInfo.className} ${
        styles[`size-${size}`]
      }`}
      title={`Rôle: ${roleInfo.text}`}
    >
      <span className={styles["role-icon"]}>{roleInfo.icon}</span>
      <span className={styles["role-text"]}>{roleInfo.text}</span>
    </span>
  );
};

export default UserRoleBadge;
