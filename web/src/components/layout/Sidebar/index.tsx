import React, { ReactNode } from "react";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  children: ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  collapsed = false,
  onToggle,
}) => {
  return (
    <aside
      className={collapsed ? styles["sidebarCollapsed"] : styles["sidebar"]}
      aria-label="Navigation latérale"
    >
      <button
        className={styles["toggleBtn"]}
        aria-label={collapsed ? "Ouvrir la sidebar" : "Réduire la sidebar"}
        onClick={onToggle}
        type="button"
      >
        {collapsed ? "▶" : "◀"}
      </button>
      <nav className={styles["content"]}>{children}</nav>
    </aside>
  );
};

export default Sidebar;
