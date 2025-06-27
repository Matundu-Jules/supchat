import React from "react";
import styles from "./ChannelsPage.module.scss";

interface EmptyChannelsStateProps {
  onCreateChannel?: () => void;
}

const EmptyChannelsState: React.FC<EmptyChannelsStateProps> = ({
  onCreateChannel,
}) => (
  <div className={styles["emptyState"]} role="status" aria-live="polite">
    <span aria-label="Aucun canal" role="img" style={{ fontSize: 48 }}>
      💬
    </span>
    <h2>Aucun canal trouvé</h2>
    <p>Créez un nouveau canal pour démarrer la discussion dans ce workspace.</p>
    {onCreateChannel && (
      <button
        className="btn"
        aria-label="Créer un canal"
        onClick={onCreateChannel}
        style={{ marginTop: 16 }}
      >
        + Créer un canal
      </button>
    )}
  </div>
);

export default EmptyChannelsState;
