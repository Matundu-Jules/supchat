import React, { useState, useEffect, useRef } from "react";
import Loader from "@components/core/ui/Loader";
import styles from "./ChannelInviteModal.module.scss";
import type { Channel } from "@ts_types/channel";

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface ChannelInviteModalProps {
  channel: Channel;
  users: User[];
  onInvite: (userIds: string[]) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}

const ChannelInviteModal: React.FC<ChannelInviteModalProps> = ({
  channel,
  users,
  onInvite,
  onClose,
  loading,
  error,
  success,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus sur la modale à l'ouverture
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  // Gestion navigation clavier (fermeture avec ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length > 0) onInvite(selected);
  };
  return (
    <div
      className={styles["overlay"]}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
      tabIndex={-1}
      ref={modalRef}
    >
      <div className={styles["modal"]}>
        <h2 id="invite-modal-title">
          Inviter des membres dans « {channel.name} »
        </h2>
        <form onSubmit={handleSubmit}>
          {users.length === 0 ? (
            <div className={styles["empty"]} role="status" aria-live="polite">
              Aucun utilisateur à inviter.
            </div>
          ) : (
            <ul className={styles["userList"]}>
              {users.map((u) => (
                <li
                  key={u.id}
                  className={
                    selected.includes(u.id) ? styles["selected"] : undefined
                  }
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.includes(u.id)}
                      onChange={() => handleToggle(u.id)}
                      disabled={loading}
                      aria-checked={selected.includes(u.id)}
                      aria-label={`Sélectionner ${u.username || u.email}`}
                    />
                    <span>{u.username || u.email}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          {error && (
            <div className={styles["error"]} role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className={styles["success"]} role="status">
              {success}
            </div>
          )}
          <div className={styles["actions"]}>
            <button
              type="submit"
              className="btn"
              disabled={loading || selected.length === 0 || users.length === 0}
              aria-label="Inviter les membres sélectionnés"
            >
              Inviter
            </button>
            <button
              type="button"
              className="btn btn-cancel"
              onClick={onClose}
              disabled={loading}
              aria-label="Annuler et fermer la modale"
            >
              Annuler
            </button>
          </div>
          {loading && <Loader />}
        </form>
      </div>
    </div>
  );
};

export default ChannelInviteModal;
