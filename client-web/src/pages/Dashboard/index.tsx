// src/pages/Dashboard/Dashboard.tsx

import styles from "./Dashboard.module.scss";
import { useNotifications } from "@hooks/useNotifications";
import NotificationList from "@components/Notification/NotificationList";

function Dashboard() {
  const { notifications, unread, markAsRead } = useNotifications();
  return (
    <section className={styles["container"]}>
      <h1 className={styles["title"]}>Tableau de bord</h1>
      <h2 className={styles["subtitle"]}>
        Notifications {unread > 0 && <span>({unread})</span>}
      </h2>
      <NotificationList items={notifications} onRead={markAsRead} />
    </section>
  );
}

export default Dashboard;
