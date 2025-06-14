import React from "react";
import { useReactions } from "@hooks/useReactions";
import styles from "./ReactionBar.module.scss";

interface ReactionBarProps {
  messageId: string;
}

const ReactionBar: React.FC<ReactionBarProps> = ({ messageId }) => {
  const { reactions, react } = useReactions(messageId);

  const grouped: Record<string, number> = {};
  reactions.forEach((r: any) => {
    grouped[r.emoji] = (grouped[r.emoji] || 0) + 1;
  });

  const handle = (emoji: string) => {
    react(emoji);
  };

  return (
    <div className={styles["bar"]}>
      {Object.entries(grouped).map(([e, count]) => (
        <button key={e} type="button" className={styles["btn"]} onClick={() => handle(e)}>
          {e} {count}
        </button>
      ))}
      <button type="button" className={styles["btn"]} onClick={() => handle("👍")}>+
      </button>
    </div>
  );
};

export default ReactionBar;
