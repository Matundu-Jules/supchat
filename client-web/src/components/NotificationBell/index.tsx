import React from "react";
import { useNotifications } from "@hooks/useNotifications";

const NotificationBell: React.FC = () => {
  const { unread } = useNotifications();
  return <button aria-label="notifications">{unread}</button>;
};

export default NotificationBell;
