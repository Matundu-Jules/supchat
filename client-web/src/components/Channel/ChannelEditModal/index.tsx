import React, { useEffect, useState } from "react";
import styles from "./ChannelEditModal.module.scss";

interface ChannelEditModalProps {
  channel: any;
  onUpdate: (data: { name: string; description: string }) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

const ChannelEditModal: React.FC<ChannelEditModalProps> = ({
  channel,
  onUpdate,
  onClose,
  loading,
  error,
}) => {
  const [name, setName] = useState(channel?.name || "");
  const [description, setDescription] = useState(channel?.description || "");

  useEffect(() => {
    setName(channel?.name || "");
    setDescription(channel?.description || "");
  }, [channel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate({ name: name.trim(), description: description.trim() });
    onClose();
  };

  return (
    <div className={styles["overlay"]}>
      <div className={styles["modal"]}>
        <button
          className={styles["closeButton"]}
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>
        <form onSubmit={handleSubmit} className={styles["form"]}>
          <label>
            Nom&nbsp;:
            <input
              className={styles["input"]}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          <label>
            Description&nbsp;:
            <input
              className={styles["input"]}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </label>
          {error && <div className={styles["error"]}>{error}</div>}
          <button type="submit" className={styles["submitButton"]} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChannelEditModal;
